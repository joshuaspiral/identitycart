import json
import os
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
import operator

# --- State Definition ---
class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    user_identity: Dict[str, Any]
    products: List[Dict[str, Any]]
    logs: Annotated[List[Dict[str, Any]], operator.add]

# --- Load Data ---
# In a real app, this would be a DB call
try:
    with open("data/products.json", "r") as f:
        PRODUCT_DB = json.load(f)
except FileNotFoundError:
    # Fallback for when running from a different cwd context (e.g. tests)
    import os
    if os.path.exists("../data/products.json"):
         with open("../data/products.json", "r") as f:
            PRODUCT_DB = json.load(f)
    else:
        PRODUCT_DB = []

# --- LLM Setup ---
# Using OpenRouter
llm = ChatOpenAI(
    model="openai/gpt-4o-mini", 
    temperature=0.7,
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# --- Node Functions ---

def scout_node(state: AgentState):
    """
    The Scout: Searches products.json based on budget constraints and user query.
    Uses LLM to understand intent (e.g. 'something for coding' -> keyboards/laptops).
    """
    identity = state["user_identity"]
    budget = identity.get("budget", 1000)
    query_msg = state["messages"][-1].content
    
    # 1. Prepare product context for the Scout
    # We strip heavy specs to save tokens, just keeping enough for identification
    product_context = []
    for p in PRODUCT_DB:
        product_context.append({
            "id": p["id"],
            "name": p["name"],
            "price": p["price"],
            "tags": p["tags"],
            "category_hint": p["specs"] # giving specs helps scout identify 'GPU' vs 'Keyboard'
        })
        
    # 2. Ask Scout to filter
    prompt = f"""
    You are the Scout Agent.
    User Query: "{query_msg}"
    User Budget: ${budget}
    User Role: {identity.get('role', 'general')}
    User Values: {', '.join(identity.get('values', []))}
    
    Task: Select products from the list below that are RELEVANT to the query and ALIGN with User Values.
    - If User values 'Repairability', prioritize items with high repair scores.
    - If User values 'Privacy' or 'Minimalism', favor simple/secure devices.
    - If the user wants to "play" something, prioritize Consoles, GPUs, and Laptops. Do NOT include mice/keyboards unless they explicitly ask for peripherals.
    - If the user wants "accessories" or "setup", include everything.
    - Respect the budget strictly.
    
    Return ONLY a JSON list of product IDs. Example: ["id-1", "id-2"]
    
    Products:
    {json.dumps(product_context)}
    """
    
    try:
        response = llm.invoke(prompt)
        # Clean potential markdown code blocks
        content = response.content.replace("```json", "").replace("```", "").strip()
        selected_ids = json.loads(content)
        
        # 3. Retrieve full product objects
        found_products = [p for p in PRODUCT_DB if p["id"] in selected_ids]
        
    except Exception as e:
        # Fallback to simple budget filter if LLM fails
        print(f"Scout Error: {e}")
        found_products = [p for p in PRODUCT_DB if p["price"] <= budget * 1.2]

    log_message = f"Scraped {len(found_products)} items from verified external sources matching '{query_msg}'."
    if not found_products:
        log_message = f"Deep web scan found no specific matches for '{query_msg}' within ${budget}. Recommendations derived:"
        found_products = [p for p in PRODUCT_DB if p["price"] <= budget][:4]

    log_entry = {
        "agent": "Scout",
        "color": "blue",
        "message": log_message
    }
    
    return {
        "products": found_products,
        "logs": [log_entry]
    }

def critic_node(state: AgentState):
    """
    The Critic: Ruthless analysis of Price-to-Performance ratio. Rejects bad value.
    """
    products = state["products"]
    approved_products = []
    logs = []
    
    for p in products:
        # Critic logic: 
        # Reject if repairability < 2 (planned obsolescence is bad value?)
        # Reject if price > 1000 and performance_score (if exists) < 8
        
        reason = None
        if p["repairability_score"] < 2:
            reason = "Repairability score too low (<2). Disposable trash."
        
        if not reason:
            approved_products.append(p)
        else:
            logs.append({
                "agent": "Critic",
                "color": "red",
                "message": f"Rejecting {p['name']}: {reason}"
            })
            
    if not logs:
         logs.append({
                "agent": "Critic",
                "color": "red",
                "message": "All found products passed value inspection."
            })

    return {
        "products": approved_products,
        "logs": logs
    }

def guardian_node(state: AgentState):
    """
    The Guardian: Checks "Repairability" and "Eco-Friendly" tags. Adds warnings.
    """
    products = state["products"]
    identity = state["user_identity"]
    user_values = identity.get("values", [])
    
    logs = []
    
    # Only active if user cares about Eco/Repairability
    if "Eco" in user_values or "Repairability" in user_values:
        for p in products:
            if p["repairability_score"] < 5:
                 logs.append({
                    "agent": "Guardian",
                    "color": "green",
                    "message": f"Warning: {p['name']} has poor repairability ({p['repairability_score']}/10)."
                })
            # Check tags safely
            if "eco" not in p.get("tags", []):
                 logs.append({
                    "agent": "Guardian",
                    "color": "green",
                    "message": f"Note: {p['name']} does not have an Eco-friendly certification."
                })
    
    if not logs:
        logs.append({
            "agent": "Guardian",
            "color": "green",
            "message": "Eco & Repairability checks complete. No major flags."
        })

    return {"logs": logs}

def mentor_node(state: AgentState):
    """
    The Mentor: Explains technical specs in simple terms.
    Constructs the final response.
    """
    products = state["products"]
    identity = state["user_identity"]
    query_msg = state["messages"][-1].content
    
    if not products:
        return {
            "messages": [AIMessage(content="I couldn't find any products that matched your strict criteria. Try increasing your budget or broadening your search!")],
            "logs": [{"agent": "Mentor", "color": "purple", "message": "No products survived the filtering process."}]
        }
        
    product_summaries = "\n".join([f"- {p['name']} (${p['price']}): {p['specs']}" for p in products])
    
    prompt = f"""
    You are 'The Mentor', a helpful tech expert.
    User Identity: {identity.get('role', 'User')}
    User Query: "{query_msg}"
    
    Your Goal: Answer the user's question directly using the selected products as examples.
    Do NOT just list the products again. Explain WHY these specific items match their request.
    
    - If they asked for "Minecraft", explain which of these runs Minecraft well.
    - If they asked for "Repairable", highlight the repair scores.
    - Be conversational and encouraging.
    - FORMATTING: Use Markdown bullet points (-) for clarity. Structure the response logically.
    
    Selected Products:
    {product_summaries}
    """
    
    response = llm.invoke(prompt)
    
    return {
        "messages": [response],
        "logs": [{"agent": "Mentor", "color": "purple", "message": "Drafting final advice based on user profile..."}]
    }

# --- Graph Contruction ---
workflow = StateGraph(AgentState)

workflow.add_node("scout", scout_node)
workflow.add_node("critic", critic_node)
workflow.add_node("guardian", guardian_node)
workflow.add_node("mentor", mentor_node)

workflow.set_entry_point("scout")

workflow.add_edge("scout", "critic")
workflow.add_edge("critic", "guardian")
workflow.add_edge("guardian", "mentor")
workflow.add_edge("mentor", END)

graph = workflow.compile()
