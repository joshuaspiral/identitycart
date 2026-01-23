"""Conversational onboarding agent for building user profiles"""

from typing import List, Dict, Any
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
import os
import json
import re


api_key = os.getenv("OPENROUTER_API_KEY", "placeholder")
llm = ChatOpenAI(
    model="openai/gpt-4o-mini",
    temperature=0.7,
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

class OnboardingChatRequest(BaseModel):
    conversation_history: List[Dict[str, str]]
    user_message: str

class OnboardingChatResponse(BaseModel):
    message: str
    complete: bool = False
    identity_profile: Dict[str, Any] = None
    partial_data: Dict[str, Any] = None  # What we've learned so far

async def extract_identity_from_conversation(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """Extract structured identity profile from conversation history"""
    
    conversation_text = "\n".join([
        f"{msg['role'].upper()}: {msg['content']}" 
        for msg in messages
    ])
    
    extraction_prompt = f"""
Extract a structured identity profile from this conversation.
Use the Assistant's questions to interpret the User's short answers (e.g. if Assistant asks "Budget?", User says "5000", then budget=5000).

Conversation:
{conversation_text}

Extract and return ONLY valid JSON with these fields:
{{
  "use_case": "what they're looking for (1 sentence)",
  "interests": ["list", "of", "interests"],
  "values": ["sustainability", "performance", etc],
  "budget_preferred": <number>,
  "budget_maximum": <number>,
  "priorities": ["what matters most to them"]
}}

Rules:
- Extract budget numbers from any mention of price/budget (e.g. "1k" = 1000, "5000" = 5000)
- IF user provides a number like "5000" in response to a budget question, USE IT.
- If no budget mentioned, use 0 for preferred.
- Keep arrays concise (3-5 items max)
- Return ONLY the JSON, no explanation
"""
    
    try:
        response = llm.invoke(extraction_prompt)
        content = response.content.strip()
        # Remove markdown code blocks if present
        content = content.replace("```json", "").replace("```", "").strip()
        extracted = json.loads(content)
        return extracted
    except Exception as e:
        print(f"Extraction error: {e}")
        return {
            "use_case": "general shopping",
            "interests": [],
            "values": [],
            "budget_preferred": 0,
            "budget_maximum": 0,
            "priorities": []
        }

async def generate_next_question(messages: List[Dict[str, str]], extracted_data: Dict[str, Any]) -> str:
    """Generate contextual follow-up question based on what's missing"""
    
    conversation_text = "\n".join([
        f"{msg['role'].upper()}: {msg['content']}" 
        for msg in messages[-4:]  # Last 2 exchanges
    ])
    
    
    needs = []
    if not extracted_data.get("use_case") or extracted_data["use_case"] == "general shopping":
        needs.append("what they're looking for")
    if not extracted_data.get("interests"):
        needs.append("their interests/hobbies")
    if not extracted_data.get("values"):
        needs.append("what matters to them when shopping")
    if not extracted_data.get("budget_preferred") or extracted_data["budget_preferred"] == 0:
        needs.append("their budget")
    
        return None
    
    prompt = f"""
You are a friendly shopping assistant having a conversation to learn about a user.

Recent conversation:
{conversation_text}

You still need to learn: {', '.join(needs)}

Generate a natural, friendly follow-up question to learn ONE of these things.
Keep it conversational and brief (1-2 sentences max).
Return ONLY the question text, no explanation.
"""
    
    try:
        response = llm.invoke(prompt)
        return response.content.strip()
        # Fallback questions
        if "what they're looking for" in needs:
            return "What brings you here today? Are you looking for something specific?"
        elif "their interests" in needs:
            return "Tell me a bit about yourself - what do you do? What are your interests?"
        elif "what matters to them" in needs:
            return "When shopping, what matters most to you? (e.g., sustainability, performance, budget)"
        else:
            return "What's your budget range for this purchase?"

async def process_chat_message(request: OnboardingChatRequest) -> OnboardingChatResponse:
    """Process chat message and build identity profile"""
    
    # Build full conversation including new message
    all_messages = request.conversation_history + [
        {"role": "user", "content": request.user_message}
    ]
    
    # Extract what we know so far
    extracted = await extract_identity_from_conversation(all_messages)
    
    # Check if we have enough information
    has_use_case = extracted.get("use_case") and extracted["use_case"] != "general shopping"
    has_real_budget = extracted.get("budget_preferred", 0) > 0
    
    # Calculate conversation depth
    user_message_count = len([m for m in all_messages if m['role'] == 'user'])
    
    should_complete = False

    # Complete if we have basics after a few turns
    if has_use_case and has_real_budget and user_message_count >= 2:
        should_complete = True
        next_question = None
        next_question = await generate_next_question(all_messages, extracted)
        # Also complete if conversation is getting long
        if has_use_case and has_real_budget and user_message_count >= 4:
            should_complete = True
            next_question = None

    if should_complete or (has_use_case and has_real_budget and next_question is None):
        # We have enough - complete the profile
        identity_profile = {
            "summary": f"Looking for: {extracted['use_case'][:80]}",
            "interests": extracted.get("interests", []),
            "use_case": extracted.get("use_case", ""),
            "values": extracted.get("values", []),
            "budget": {
                "preferred": extracted.get("budget_preferred", 1000),
                "maximum": extracted.get("budget_maximum", extracted.get("budget_preferred", 1000) * 1.2)
            },
            "personality": {
                "shopping_style": "researcher",
                "priorities": extracted.get("priorities", []),
                "deal_breakers": []
            },
            "role": "shopper"
        }
        
        return OnboardingChatResponse(
            message="Perfect! I have everything I need. Let's find some great products for you! 🎯",
            complete=True,
            identity_profile=identity_profile
        )
    
    if next_question:
        return OnboardingChatResponse(
            message=next_question,
            complete=False,
            partial_data=extracted
        )
    else:
        # Edge case fallback
        return OnboardingChatResponse(
            message="Could you tell me a bit more about what you're looking for?",
            complete=False,
            partial_data=extracted
        )
