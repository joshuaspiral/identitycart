# IdentityCart Setup

Quick setup guide for running the project locally.

## Prerequisites

- Node.js 18+
- Python 3.10+
- OpenRouter API key ([sign up here](https://openrouter.ai/))

## Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at `http://localhost:3000`

## Usage

1. Open `http://localhost:3000`
2. Complete the onboarding chat to set up your profile
3. Search for products and get AI-powered recommendations


