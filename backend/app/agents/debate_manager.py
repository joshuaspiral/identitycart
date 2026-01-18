"""
Debate Manager: Orchestrates multi-agent debates and consensus building.
This is the core intelligence that makes agents actually discuss and negotiate.
"""

from typing import List, Dict, Any
from app.agents.debate_types import (
    DebateMessage, DebateState, ProductProposal, 
    ProductChallenge, ConsensusResult
)
from langchain_openai import ChatOpenAI
import os

class DebateManager:
    """Manages the debate process between agents."""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        
    async def facilitate_product_debate(
        self,
        proposals: List[ProductProposal],
        user_identity: Dict[str, Any]
    ) -> List[ConsensusResult]:
        """
        Orchestrates a debate about proposed products.
        
        Process:
        1. Each agent proposes products with reasoning
        2. Other agents challenge proposals they disagree with
        3. Proposing agents defend their choices
        4. Group negotiates to consensus
        5. Final products are approved or rejected
        """
        
        debate_messages = []
        consensus_results = []
        
        for proposal in proposals:
            # Step 1: Announce proposal
            debate_messages.append(DebateMessage(
                agent=proposal.proposing_agent,
                message_type="PROPOSAL",
                product_id=proposal.product_id,
                reasoning=f"I propose {proposal.product['name']}: {', '.join(proposal.reasons)}",
                confidence=proposal.confidence
            ))
            
            # Step 2: Get challenges from other agents
            challenges = await self._get_challenges(proposal, user_identity)
            
            for challenge in challenges:
                debate_messages.append(DebateMessage(
                    agent=challenge.challenging_agent,
                    message_type="CHALLENGE",
                    product_id=proposal.product_id,
                    reasoning=challenge.reason,
                    confidence=0.7 if challenge.severity == "critical" else 0.4
                ))
            
            # Step 3: If challenged, get defense
            if challenges:
                defense = await self._get_defense(proposal, challenges, user_identity)
                debate_messages.append(DebateMessage(
                    agent=proposal.proposing_agent,
                    message_type="DEFENSE",
                    product_id=proposal.product_id,
                    reasoning=defense,
                    confidence=proposal.confidence
                ))
            
            # Step 4: Build consensus
            consensus = await self._build_consensus(
                proposal, 
                challenges, 
                user_identity
            )
            consensus_results.append(consensus)
            
            # Log consensus decision
            if consensus.approved:
                debate_messages.append(DebateMessage(
                    agent="System",
                    message_type="CONSENSUS",
                    product_id=proposal.product_id,
                    reasoning=f"✅ APPROVED by {len(consensus.supporting_agents)}/4 agents. {consensus.negotiation_summary}",
                    confidence=consensus.final_confidence
                ))
            else:
                debate_messages.append(DebateMessage(
                    agent="System",
                    message_type="CONSENSUS",
                    product_id=proposal.product_id,
                    reasoning=f"❌ REJECTED by majority. {consensus.negotiation_summary}",
                    confidence=1.0 - consensus.final_confidence
                ))
        
        return consensus_results, debate_messages
    
    async def _get_challenges(
        self,
        proposal: ProductProposal,
        user_identity: Dict[str, Any]
    ) -> List[ProductChallenge]:
        """
        Have other agents evaluate and potentially challenge a proposal.
        """
        challenges = []
        product = proposal.product
        
        # Critic challenges based on value
        if proposal.proposing_agent != "Critic":
            critic_challenge = await self._critic_evaluate(product, user_identity)
            if critic_challenge:
                challenges.append(ProductChallenge(
                    product_id=proposal.product_id,
                    challenging_agent="Critic",
                    reason=critic_challenge,
                    severity="moderate"
                ))
        
        # Guardian challenges based on ethics
        if proposal.proposing_agent != "Guardian":
            guardian_challenge = await self._guardian_evaluate(product, user_identity)
            if guardian_challenge:
                challenges.append(ProductChallenge(
                    product_id=proposal.product_id,
                    challenging_agent="Guardian",
                    reason=guardian_challenge,
                    severity="critical" if "repairability" in guardian_challenge.lower() else "moderate"
                ))
        
        return challenges
    
    async def _critic_evaluate(self, product: Dict, user_identity: Dict) -> str:
        """Critic evaluates if product is good value."""
        price = product.get("price", 0)
        budget = user_identity.get("budget", 1000)
        perf_score = product.get("specs", {}).get("perf_score", 5)
        
        # Challenge if price is >80% of budget but performance is <7
        if price > budget * 0.8 and perf_score < 7:
            return f"This product costs ${price} ({int(price/budget*100)}% of budget) but only scores {perf_score}/10 in performance. Poor value proposition."
        
        # Challenge if price-to-performance ratio is bad
        if price > 0 and perf_score / (price / 100) < 0.5:
            return f"Price-to-performance ratio is concerning: ${price} for {perf_score}/10 performance."
        
        return ""
    
    async def _guardian_evaluate(self, product: Dict, user_identity: Dict) -> str:
        """Guardian evaluates ethical concerns."""
        repair_score = product.get("repairability_score", 5)
        user_values = user_identity.get("values", [])
        
        # Challenge if user values repairability but product scores low
        if "Repairability" in user_values and repair_score < 5:
            return f"User values Right to Repair, but this product scores {repair_score}/10 in repairability. This conflicts with their ethics."
        
        if "Eco" in user_values and "eco" not in product.get("tags", []):
            return f"User values eco-friendliness, but this product lacks environmental certifications."
        
        return ""
    
    async def _get_defense(
        self,
        proposal: ProductProposal,
        challenges: List[ProductChallenge],
        user_identity: Dict
    ) -> str:
        """Get the proposing agent's defense against challenges."""
        
        challenge_text = "\n".join([
            f"- {c.challenging_agent}: {c.reason}"
            for c in challenges
        ])
        
        prompt = f"""
You are the {proposal.proposing_agent} agent defending your product recommendation.

Product: {proposal.product['name']}
Your reasoning: {', '.join(proposal.reasons)}

Challenges raised:
{challenge_text}

Provide a brief, compelling defense (2-3 sentences) addressing these concerns while staying true to your agent role.
If the challenges are valid, acknowledge them but explain why the product is still worth considering.
"""
        
        response = self.llm.invoke(prompt)
        return response.content.strip()
    
    async def _build_consensus(
        self,
        proposal: ProductProposal,
        challenges: List[ProductChallenge],
        user_identity: Dict
    ) -> ConsensusResult:
        """
        Determine if product should be approved based on debate.
        
        Voting system (REVISED - less strict):
        - Proposing agent: Always supports
        - Agents with CRITICAL challenges: Oppose
        - Agents with MODERATE challenges: Neutral (don't block)
        - Non-participating agents: Support (no objections)
        - Product approved if: support >= 2 agents AND critical_challenges == 0
        """
        
        supporting_agents = [proposal.proposing_agent]
        opposing_agents = []
        
        # Only count CRITICAL challenges as blocking
        critical_challenges = [c for c in challenges if c.severity == "critical"]
        moderate_challenges = [c for c in challenges if c.severity != "critical"]
        
        for challenge in critical_challenges:
            opposing_agents.append(challenge.challenging_agent)
        
        # Non-challenging agents support (they had a chance to object but didn't)
        all_agents = ["Scout", "Critic", "Guardian", "Mentor"]
        challenging_agents = set([c.challenging_agent for c in challenges])
        
        for agent in all_agents:
            if agent not in supporting_agents and agent not in challenging_agents:
                supporting_agents.append(agent)  # No objection = support
        
        # Determine approval: Need 2+ supporters AND zero critical challenges
        approved = len(supporting_agents) >= 2 and len(critical_challenges) == 0
        
        # Calculate final confidence
        base_confidence = proposal.confidence
        # Reduce by 0.1 for each moderate challenge, 0.3 for critical
        confidence_penalty = (len(moderate_challenges) * 0.1) + (len(critical_challenges) * 0.3)
        final_confidence = max(0.1, base_confidence - confidence_penalty)
        
        # Generate negotiation summary
        if approved:
            if len(challenges) == 0:
                summary = "Unanimous approval - no concerns raised."
            elif len(moderate_challenges) > 0:
                summary = f"Approved with {len(moderate_challenges)} noted concern(s). Benefits outweigh risks."
            else:
                summary = "Approved by consensus."
        else:
            if len(critical_challenges) > 0:
                summary = f"Blocked by {len(critical_challenges)} critical concern(s)."
            else:
                summary = "Insufficient support from agent team."
        
        return ConsensusResult(
            product_id=proposal.product_id,
            approved=approved,
            supporting_agents=supporting_agents,
            opposing_agents=opposing_agents,
            final_confidence=final_confidence,
            negotiation_summary=summary
        )
