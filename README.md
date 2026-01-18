# IdentityCart - Setup Instructions

This guide will help you run the IdentityCart application locally.

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

---

## 1. Backend Setup (FastAPI + AI Agents)

### Install Python Dependencies

```bash
cd backend
pip install fastapi uvicorn langchain-openai langgraph python-dotenv pydantic
```

### Configure API Key

1. Create a `.env` file in the `backend` folder:
   ```
   backend/.env
   ```

2. Add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

   > **Note:** Get your API key from [OpenRouter](https://openrouter.ai/)

### Start the Backend Server

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

The backend API will be available at: **http://localhost:8000**

---

## 2. Frontend Setup (Next.js)

### Install Node Dependencies

```bash
cd frontend
npm install
```

### Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will be available at: **http://localhost:3000**

---

## 3. Running Both Servers

You'll need **two terminal windows** to run both servers simultaneously:

| Terminal | Directory | Command |
|----------|-----------|---------|
| Terminal 1 | `backend/` | `python -m uvicorn app.main:app --reload --port 8000` |
| Terminal 2 | `frontend/` | `npm run dev` |

---

## 4. Using the Application

1. Open your browser and go to **http://localhost:3000**
2. Set up your identity profile (role, budget, values)
3. Start chatting with the AI agents to get personalized product recommendations!

---

## Troubleshooting

### "next is not recognized"
Run `npm install` in the `frontend` folder first.

### "OPENROUTER_API_KEY not set"
Make sure you created the `.env` file in the `backend` folder with your API key.

### Backend won't start
Ensure all Python dependencies are installed:
```bash
pip install fastapi uvicorn langchain-openai langgraph python-dotenv pydantic
```

### Port already in use
- Frontend default: 3000
- Backend default: 8000

If these ports are busy, you can change them:
- Frontend: `npm run dev -- -p 3001`
- Backend: `python -m uvicorn app.main:app --reload --port 8001`

---

## Project Structure

```
identitycart-main/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI server
│   │   └── agents/
│   │       └── graph.py     # AI agent logic (Scout, Critic, Guardian, Mentor)
│   ├── data/
│   │   └── products.json    # Product database
│   └── .env                 # API keys (create this!)
│
└── frontend/
    ├── src/
    │   └── app/             # Next.js pages
    ├── package.json
    └── ...
```
