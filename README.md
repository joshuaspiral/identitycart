# IdentityCart Intelligence Platform 🛡️🛒

**Identity-First Commerce for the Modern Web.**

IdentityCart is a Next.js + FastAPI powered agentic commerce platform that rethinks how we shop online. Instead of browsing endless catalogs, users define their **Identity Profile** (Gamers, Creators, Privacy Advocates) and let a swarm of AI agents curate a marketplace specifically for them.

![IdentityCart Dashboard](https://placehold.co/1200x600/000000/FFF?text=IdentityCart+Dashboard&font=roboto)

## 🚀 Features

### for the Hackathon Submission:
  - Visualizes the multi-agent decision process in real-time.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion.
- **Backend**: FastAPI, LangGraph (Multi-Agent Orchestration), LangChain.
- **AI**: OpenAI GPT-4o-mini (via OpenRouter).
- **Data**: Static "Golden Set" of 50+ high-fidelity tech products (Q1 2026 pricing).

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- `OPENROUTER_API_KEY` environment variable.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/joshuaspiral/identitycart.git
   cd identitycart
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   export OPENROUTER_API_KEY=your_key_here
   uvicorn app.main:app --reload
   ```

4. **Launch**
   Open [http://localhost:3000](http://localhost:3000) to begin authorization.

## 👥 The Team

- **Agent Scout**: Discovery
- **Agent Critic**: Value Analysis
- **Agent Guardian**: Ethics & Safety
- **Agent Mentor**: User Liaison

---
