#IdentityCart

#Authors
- Ali
- Joshua
- Sean

## TL;DR
**IdentityCart** is an AI-powered ecommerce assistant that helps users make confident purchasing decisions based on *who they are*, not just specs. By combining secure passkey authentication, identity-based personalization, and a multi-agent AI tribunal built with **LangGraph**, IdentityCart debates products on your behalf and explains why a recommendation fits your unique profile.

> **Think:** Personal finance meets AI agents meets trust-first shopping.

---

## Inspiration
We’ve all experienced the same problem: **50 browser tabs open**, two products that look nearly identical, and a $500 price difference we can’t rationalize.

The modern shopping experience is broken because it ignores **identity**. It treats everyone the same—even though a student, gamer, creator, or budget-conscious buyer should never receive identical advice.

We realized that identity isn’t just a name or login—it’s your needs, values, constraints, and long-term goals. So instead of asking users to compare products manually, we asked a different question:

**What if products had to prove they deserved your identity?**

That idea became IdentityCart.

---

## What it does
IdentityCart is an AI-powered ecommerce assistant that helps users make confident purchasing decisions based on who they are, not just technical specs.

When a user searches for a product (e.g., "mechanical keyboard"), IdentityCart launches a **Tribunal of AI Agents** that debate the options on the user’s behalf. Each agent protects a different part of the user’s identity:

- **Scout**: Finds and structures real product data via real-time search.
- **Critic**: Evaluates price-to-performance and value (The "Grumpy" guardian of your wallet).
- **Mentor**: Translates technical jargon into plain English and checks cognitive load.
- **Guardian**: Evaluates sustainability, repairability, and long-term impact.

Instead of returning a list of links, IdentityCart delivers:
1.  A final collaborative recommendation.
2.  A transparent communication log (The "Live Feed").
3.  A clear explanation of *why* this product fits the user’s identity.

Users don’t just see *what* to buy—they understand *why*.

---

## How we built it
We built a modern, agentic web application using **Next.js** and **Python**:

### **Frontend**
- **Next.js 14**: For a high-performance, server-rendered React application.
- **Tailwind CSS & Shadcn/UI**: To create a clean, "sharp industrial" interface that visualizes the AI agents debating in real time.
- **Glassmorphism**: Used to give the "Tribunal" a modern, transparent feel.

### **Backend**
- **FastAPI**: Serving the agentic workflow.
- **LangGraph**: The core orchestration engine. We designed a stateful "Agent Tribunal" where a shared `UserIdentity` and `ProductContext` are passed between specialized agents.
- **SERP API**: Powers the "Scout" agent, allowing real-time retrieval of live product listings, pricing signals, and metadata from global retailers.

### **Multi-Agent Orchestration**
Instead of a single LLM response, we built a **graph**.
1.  **Orchestration**: A "Supervisor" node manages the hand-offs.
2.  **Debate**: The Critic and Mentor review the Scout's findings before presenting them to the user.
3.  **State**: The user's Identity Profile (Budget: $2000, Role: Student) persists and influences every decision.

---

## Challenges we ran into
- **Agent Orchestration**: Getting four AI agents to actually "argue" productively was difficult. Initially, they would all agree too easily ("Yes, buy this!"). We had to engage in rigorous system prompt engineering to give The Critic a cynical personality and The Mentor a patient one.
- **State Management in LangGraph**: Passing the user's "Identity Profile" cleanly through every node of the graph without hallucinating data was a complex engineering challenge.
- **Streaming Responses**: We wanted the user to see the "Agent Tribunal" thinking in real-time. Connecting the customized LangGraph stream to the React frontend required careful handling of Server-Sent Events (SSE).
- **Search Reliability**: Moving from static mock data to live SERP-powered queries introduced challenges around inconsistent result formats (e.g. "Galaxy Book" being categorized as "Phone"), requiring robust regex extraction and classification logic.

---

## Accomplishments that we're proud of
- **Transparent Communication Log**: We didn't hide the AI logic. We successfully visualized the LangGraph execution in the UI, fulfilling the challenge requirement to show a "transparent, human-readable communication log."
- **The "Identity" Pivot**: We moved beyond a generic "Shopping Bot" to something that feels personal. Seeing the agents reject a product because *"it doesn't fit the Student Identity"* feels genuinely intelligent.
- **Real Agent Debate**: Watching the **Critic** flag a product as "Overpriced" while the **Mentor** defends it for its "Usability" creates a genuine sense of a balanced decision-making process.

---

## What we learned
- **The Power of Agency**: AI is significantly more powerful when you break it into specialized roles. A "Generalist" model is okay, but a specialized "Critic" model interacting with a "Scout" model produces far superior insights.
- **Graph Theory in AI**: Learning LangGraph opened our eyes to how complex, stateful workflows can be built with LLMs.
- **UI Quality Drives Trust**: Even strong AI feels unreliable without a clean, intuitive interface. Visual clarity directly affects user confidence.
- **Progressive Disclosure**: Presenting insights step-by-step prevents cognitive overload and keeps the experience approachable.

---

## What's next for IdentityCart
- **Real-Time Retail APIs**: Connecting directly to BestBuy/Amazon Product APIs for cleaner data.
- **Browser Extension**: Bringing the "Agent Tribunal" with you to any URL. Imagine visiting an Amazon product page and having The Critic pop up to tell you it's overpriced.
- **Collaborative Carts**: Allowing teams or families to merge their "Identity Profiles" to find products that work for everyone (e.g., a TV that fits the gamer's needs and the budget's constraints).


