from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
from fastapi.middleware.cors import CORSMiddleware
from app.agents.graph import graph
from langchain_core.messages import HumanMessage
import uvicorn

app = FastAPI(title="IdentityCart Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    identity: IdentityProfile

@app.get("/")
async def root():
    return {"status": "ok", "message": "IdentityCart Backend Running"}

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Endpoint to trigger the Multi-Agent System.
    Accepts user identity and a message (search query).
    Returns a stream of agent thoughts/actions.
    """
    try:
        # Prepare the state for the graph
        initial_state = {
            "messages": [HumanMessage(content=request.message)],
            "user_identity": request.identity.dict(),
            "products": [], # To be filled by Scout
            "logs": []      # To accumulate agent logs
        }

        # Run the graph
        # For MVP simplicity, we run it synchronously and return the final state logs
        # In a real streaming setup, we'd use StreamingResponse
        # But per requirements "Return a stream of messages" - we will simulate this by returning the full log list
        # detailed implementation in graph.py will handle the logic
        
        result = await graph.ainvoke(initial_state)
        
        return {
            "logs": result.get("logs", []),
            "products": result.get("products", []), # NEW: Explicitly return products
            "final_response": result.get("messages")[-1].content
        }

    except Exception as e:
        # Log the error on the server side
        print(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
