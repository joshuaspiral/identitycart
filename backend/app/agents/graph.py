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
    product_analysis: Dict[str, Any] 

# Static product fallback data
try:
    with open("data/products.json", "r") as f:
        PRODUCT_DB = json.load(f)
except FileNotFoundError:
    PRODUCT_DB = []

# LLM setup
llm = ChatOpenAI(
    model="openai/gpt-4o-mini", 
    temperature=0.7,
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)



def scout_node(state: AgentState):
    """Find and filter products based on query and budget"""
    query_msg = state["messages"][0].content.lower()
    user_identity = state["user_identity"]
    # Robust budget handling
    raw_budget = user_identity.get("budget", 10000)
    try:
        if isinstance(raw_budget, dict):
             # Identity profile uses "maximum" and "preferred" keys
             max_budget = raw_budget.get("maximum")
             pref_budget = raw_budget.get("preferred")
             # Use maximum if it exists and is > 0, otherwise use preferred, otherwise default
             if max_budget and max_budget > 0:
                 budget = int(max_budget)
             elif pref_budget and pref_budget > 0:
                 budget = int(pref_budget)
             else:
                 budget = 10000
        else:
             budget = int(raw_budget) if raw_budget else 10000
    except (ValueError, TypeError):
        budget = 10000
    
    logs = []
    
    # Add premium keywords for high-budget tech searches
    tech_keywords = ["laptop", "computer", "phone", "monitor", "tv", "camera", "headphone", "watch", "tablet"]
    
    if budget >= 3000 and "cheap" not in query_msg and "budget" not in query_msg:
        # Check if query contains any tech keyword
        if any(k in query_msg for k in tech_keywords):
             optimized_query += " best top rated premium"
            
    logs.append({
        "agent": "Scout",
        "color": "blue",
        "message": f"Analyzing request for '{query_msg}' with budget ${budget}..."
    })
            
    # Silent optimization (Internal thought, not logged to user to avoid confusion)
    # if optimized_query != query_msg:
    #     logs.append(...) 

    from app.services.product_search import search_products
    
    print(f"🔍 Scout: Searching real-time for '{optimized_query}'")
    all_products = search_products(optimized_query, max_results=20)
    
    if not all_products:
        print("❌ No products found from API")
        return {
            "products": [],
            "logs": logs + [{
                "agent": "Scout",
                "color": "red",
                "message": f"Deep web scan found no candidates for '{optimized_query}'. API may be unresponsive."
            }]
        }
    
    print(f"✅ Found {len(all_products)} live products")
    logs.append({
        "agent": "Scout",
        "color": "blue",
        "message": f"Scraped {len(all_products)} raw candidates from global retailers..."
    })
    
    # Filter by budget with strict and relaxed caps
    strict_cap = budget * 1.2
    hard_cap = budget * 1.5 
    min_price = budget * 0.15 if budget > 1000 else 0 
    
    # Strict filtering pass
    for p in all_products:
        price = p.get("price", 0)
        if min_price <= price <= strict_cap:
            found_products.append(p)
            
        # Relaxed filtering if needed
        logs.append({
            "agent": "Scout",
            "color": "blue",
            "message": "Strict filtering yielded 0 results. Checking slightly above budget..."
        })
        for p in all_products:
            price = p.get("price", 0)
            if price <= hard_cap:
                found_products.append(p)
    
    
    found_products = found_products[:8]
    
    if found_products:
        logs.append({
            "agent": "Scout",
            "color": "green",
            "message": f"Qualified {len(found_products)} items within budget range."
        })
    else:
        logs.append({
            "agent": "Scout",
            "color": "red",
            "message": f"Critical: No products found under ${hard_cap}. Please increase budget or specificty."
        })

    
    return {
        "products": found_products,
        "logs": logs
    }

def critic_node(state: AgentState):
    """Analyze price-to-performance and value"""
    products = state["products"]
    identity = state["user_identity"]
    
    logs = []
    logs.append({
        "agent": "Critic",
        "color": "orange",
        "message": f"Initiating value analysis on {len(products)} candidates..."
    })
    
    # Robust budget handling
    raw_budget = identity.get("budget", 1000)
    try:
        if isinstance(raw_budget, dict):
             # Identity profile uses "maximum" and "preferred" keys
             max_budget = raw_budget.get("maximum")
             pref_budget = raw_budget.get("preferred")
             # Use maximum if it exists and is > 0, otherwise use preferred, otherwise default
             if max_budget and max_budget > 0:
                 budget = int(max_budget)
             elif pref_budget and pref_budget > 0:
                 budget = int(pref_budget)
             else:
                 budget = 1000
        else:
             budget = int(raw_budget) if raw_budget else 1000
    except (ValueError, TypeError):
        budget = 1000
    
    analysis = state.get("product_analysis", {})
    
    rejected_count = 0
    
    for p in products:
        p_id = p.get("id")
        if p_id not in analysis:
            analysis[p_id] = {}
            
        # Calculate value score
        price_ratio = p["price"] / (budget * 1.2)
        base_score = max(0, 100 - (price_ratio * 80)) # cheaper is better base
        repaired_score = (base_score + (p["repairability_score"] * 2)) 
        final_value_score = min(100, int(repaired_score))
        
        analysis[p_id]["value_score"] = final_value_score
        
        # Estimate hidden costs
        name = p["name"].lower()
        hidden_cost = "Low"
        if any(b in name for b in ["apple", "macbook", "printer", "subscription"]):
            hidden_cost = "High"
        elif any(b in name for b in ["razer", "alienware", "sony"]):
            hidden_cost = "Medium"
            
        analysis[p_id]["hidden_cost_risk"] = hidden_cost
        
        # Deal timing heuristic
        deal_timing = "Buy Now"
        if "renewed" in name or "refurbished" in name:
             deal_timing = "Great Price"
        elif "2024" in name or "latest" in name:
             deal_timing = "Wait (New Release)"
             
        analysis[p_id]["deal_timing"] = deal_timing

        if final_value_score < 40:
             logs.append({
                "agent": "Critic",
                "color": "red",
                "message": f"Critic Warning: {p['name']} has poor value score ({final_value_score}/100)."
            })
             rejected_count += 1
        elif final_value_score > 85:
             logs.append({
                "agent": "Critic",
                "color": "green",
                "message": f"Value Pick: {p['name']} offers exceptional specs for the price."
            })
            
    if rejected_count == 0:
         logs.append({
                "agent": "Critic",
                "color": "orange",
                "message": "All items passed value inspection. Wallet safety confirmed."
            })
    else:
        logs.append({
            "agent": "Critic",
            "color": "orange",
            "message": f"Flagged {rejected_count} items as poor value propositions."
        })

    return {
        "product_analysis": analysis,
        "logs": logs
    }

def guardian_node(state: AgentState):
    """Check repairability and sustainability"""
    products = state["products"]
    analysis = state.get("product_analysis", {})
    
    logs = []
    logs.append({
        "agent": "Guardian",
        "color": "green",
        "message": f"Scanning {len(products)} products for ethical and repairability standards..."
    })
    
    issues_found = 0
    
    for p in products:
        p_id = p.get("id")
        if p_id not in analysis: analysis[p_id] = {}
        
        # Repairability confidence
        score = p["repairability_score"]
        confidence = "Low"
        if score >= 7: confidence = "High"
        elif score >= 5: confidence = "Medium"
        
        analysis[p_id]["repairability_confidence"] = confidence
        
        # Estimate longevity
        longevity = "3-4 Years"
        if score >= 8: longevity = "5+ Years (Upgradeable)"
        elif score <= 3: longevity = "2-3 Years (Disposable)"
        
        analysis[p_id]["longevity_score"] = longevity
        
        if score < 4:
             logs.append({
                "agent": "Guardian",
                "color": "green",
                "message": f"Planned Obsolescence Alert: {p['name']} is hard to repair."
            })
             issues_found += 1
    
    if issues_found == 0:
        logs.append({
            "agent": "Guardian",
            "color": "green",
            "message": "Sustainability checks complete. No major ethical flags."
        })
    else:
        logs.append({
            "agent": "Guardian",
            "color": "green",
            "message": f"Identified {issues_found} potential sustainability risks."
        })

    return {"product_analysis": analysis, "logs": logs}

def mentor_node(state: AgentState):
    """Explain specs and generate final recommendation"""
    products = state["products"]
    identity = state["user_identity"]
    query_msg = state["messages"][-1].content
    analysis = state.get("product_analysis", {})
    role = identity.get("role", "User").lower()
    
    # Calculate cognitive load for each product
    for p in products:
        p_id = p.get("id")
        if p_id not in analysis:
            analysis[p_id] = {}
        name = p["name"].lower()
        
        load = "Medium"
        if "pro" in name or "developer" in name or "linux" in name:
            load = "High" if "dev" not in role and "eng" not in role else "Low"
        elif "macbook" in name or "console" in name or "iphone" in name:
            load = "Low"
            
        analysis[p_id]["cognitive_load"] = load
    
    # Merge analysis data into products
    for p in products:
        p_id = p.get("id")
        if p_id in analysis:
            p.update(analysis[p_id])

    if not products:
        return {
            "messages": [AIMessage(content="I couldn't find any products that matched your strict criteria. Try increasing your budget or broadening your search!")],
            "logs": [{"agent": "Mentor", "color": "purple", "message": "No products survived the filtering process."}]
        }
        
    product_summaries = "\n".join([
        f"- {p['name']} (${p['price']}) [Value: {p.get('value_score', 'N/A')}/100]" + 
        (f": {', '.join([f'{k}: {v}' for k, v in p.get('specs', {}).items()])}" if isinstance(p.get('specs'), dict) and p.get('specs') else " (Specs: See product details)")
        for p in products
    ])
    
    prompt = f"""
    You are 'The Mentor', a helpful tech expert.
    User Identity: {identity.get('role', 'User')}
    User Query: "{query_msg}"
    
    Your Goal: Answer the user's question directly using the selected products as examples.
    Do NOT just list the products again. Explain WHY these specific items match their request.
    
    - If they asked for "Minecraft", explain which of these runs Minecraft well.
    - If they asked for "Repairable", highlight the repair scores.
    - Be conversational and encouraging.
    - Mention specific metrics if relevant (e.g. "This has a high value score of 95/100").
    - FORMATTING: Use Markdown bullet points (-) for clarity. Structure the response logically.
    
    Selected Products:
    {product_summaries}
    """
    
    # Generate response
    response = llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "messages": [response],
        "products": products, 
        "logs": [{"agent": "Mentor", "color": "purple", "message": f"Synthesizing final advice based on {len(products)} verified options..."}]
    }

# Graph construction
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
