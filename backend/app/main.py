from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from fastapi.middleware.cors import CORSMiddleware
from app.agents.graph import graph
from langchain_core.messages import HumanMessage
import uvicorn
import os

from app.onboarding.chat_agent import process_chat_message, OnboardingChatRequest

app = FastAPI(title="IdentityCart Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IdentityProfile(BaseModel):
    role: str
    budget: int
    values: List[str]

class ChatRequest(BaseModel):
    message: str
    identity: Dict[str, Any]

class ChatResponse(BaseModel):
    logs: List[Dict[str, Any]]
    products: List[Dict[str, Any]]
    final_response: str

@app.get("/")
def read_root():
    return {"message": "IdentityCart Backend API", "status": "running"}

@app.post("/onboarding/chat")
async def onboarding_chat(request: OnboardingChatRequest):
    """Conversational onboarding to build user profile"""
    try:
        response = await process_chat_message(request)
        return response.dict()
    except Exception as e:
        return {
            "message": f"Sorry, I encountered an error: {str(e)}",
            "complete": False
        }

async def process_chat(request: ChatRequest) -> ChatResponse:
    """Process chat request and run agent graph"""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key or api_key == "placeholder_key_not_set":
        return ChatResponse(
            logs=[
                {"agent": "System", "color": "red", "message": "⚠️ OPENROUTER_API_KEY not set"},
                {"agent": "System", "color": "blue", "message": "Get a free API key at https://openrouter.ai/"},
                {"agent": "System", "color": "blue", "message": "Set it: export OPENROUTER_API_KEY=your_key"}
            ],
            products=[],
            final_response="## API Key Required\n\nSet OPENROUTER_API_KEY environment variable to use the AI agents.\n\nGet a key at https://openrouter.ai/"
        )
    
    initial_state = {
        "messages": [HumanMessage(content=request.message)],
        "user_identity": request.identity,
        "products": [],
        "logs": []
    }

    result = await graph.ainvoke(initial_state)
    
    return ChatResponse(
        logs=result.get("logs", []),
        products=result.get("products", []),
        final_response=result.get("messages")[-1].content
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Main chat endpoint - triggers multi-agent product search"""
    try:
        return await process_chat(request)
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID"""
    try:
        import json
        with open("data/products.json", "r") as f:
            products = json.load(f)
            
        product = next((p for p in products if p["id"] == product_id), None)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        return product
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Products database not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
