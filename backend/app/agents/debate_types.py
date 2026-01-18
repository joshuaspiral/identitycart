from typing import TypedDict, List, Dict, Any, Literal, Annotated
from pydantic import BaseModel
from datetime import datetime
import operator

# Debate Message Types
class DebateMessage(BaseModel):
    """Represents a single message in the agent debate."""
    agent: str
    message_type: Literal["PROPOSAL", "CHALLENGE", "DEFENSE", "AGREEMENT", "CONSENSUS"]
    product_id: str
    reasoning: str
    confidence: float  # 0.0 to 1.0
    references: List[str] = []  # Citations or data points
    timestamp: str = ""
    
    def __init__(self, **data):
        if 'timestamp' not in data or not data['timestamp']:
            data['timestamp'] = datetime.now().isoformat()
        super().__init__(**data)

class DebateState(TypedDict):
    """Extended state for debate tracking."""
    messages: List[Any]  # LangChain messages
    user_identity: Dict[str, Any]
    products: List[Dict[str, Any]]
    logs: Annotated[List[Dict[str, Any]], operator.add]  # FIXED: Now appends instead of replaces
    debate_messages: List[DebateMessage]  # NEW: Structured debate messages
    proposals: Dict[str, List[str]]  # agent -> list of product IDs they propose
    challenges: Dict[str, Dict[str, str]]  # product_id -> {agent: reason}
    agreements: Dict[str, List[str]]  # product_id -> list of agents who agree
    consensus_products: List[str]  # Final agreed-upon product IDs

class ProductProposal(BaseModel):
    """A product proposed by an agent."""
    product_id: str
    product: Dict[str, Any]
    proposing_agent: str
    reasons: List[str]
    confidence: float
    
class ProductChallenge(BaseModel):
    """A challenge raised against a product."""
    product_id: str
    challenging_agent: str
    reason: str
    severity: Literal["minor", "moderate", "critical"]
    
class ConsensusResult(BaseModel):
    """Result of consensus building."""
    product_id: str
    approved: bool
    supporting_agents: List[str]
    opposing_agents: List[str]
    final_confidence: float
    negotiation_summary: str
