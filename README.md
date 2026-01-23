# IdentityCart

**Authors:** Ali, Joshua, Sean

An AI-powered shopping assistant that provides personalized product recommendations based on user identity profiles (budget, values, use case).

## What It Does

Instead of giving users a generic list of search results, IdentityCart uses a multi-agent AI system to evaluate products through different lenses:

- **Scout** - Searches for products and gathers data
- **Critic** - Analyzes price-to-performance ratio and value
- **Guardian** - Evaluates sustainability and repairability
- **Mentor** - Explains technical specs in plain language

Users complete a conversational onboarding to build their identity profile, then chat with the system to get tailored recommendations with transparent reasoning.

## Tech Stack

**Backend:**
- FastAPI for the REST API
- LangGraph for orchestrating the multi-agent workflow
- OpenAI models via OpenRouter for the agent reasoning
- SerpAPI for real-time product search (optional)

**Frontend:**
- Next.js 14 (React)
- Tailwind CSS + shadcn/ui components
- Server-sent events for streaming agent responses

## Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- OpenRouter API key ([get one here](https://openrouter.ai/))
- (Optional) SerpAPI key for live product search

### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "OPENROUTER_API_KEY=your_key_here" > .env
# Optional: Add SERPAPI_API_KEY for live search

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. Navigate to the app and start the onboarding conversation
2. Answer a few questions about what you're looking for and your budget
3. Once your profile is set up, search for products
4. The AI agents will debate the options and provide a recommendation with full reasoning

## Project Structure

```
identitycart/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes
│   │   ├── agents/
│   │   │   ├── graph.py         # LangGraph agent orchestration
│   │   │   └── debate_types.py  # Type definitions
│   │   ├── onboarding/
│   │   │   └── chat_agent.py    # Conversational profile builder
│   │   └── services/
│   │       └── product_search.py # SerpAPI integration
│   └── data/
│       └── products.json         # Fallback product data
│
└── frontend/
    ├── app/                      # Next.js pages
    ├── components/               # UI components
    └── public/
```



## Future Ideas

- Add browser extension to analyze products on any e-commerce site
- Implement user accounts and saved profiles
- Direct integration with retailer APIs for better product data
- Support for collaborative shopping (family/team profiles)

## License

Built for UofTHacks. MIT Licensea.
