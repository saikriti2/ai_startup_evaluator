# AI Startup Evaluator

A premium, full-stack web application designed to intake unstructured startup ideas or meeting notes, parse them using Google's Gemini AI, and generate comprehensive, structured business reports. 

## 🚀 Features (From Largest to Smallest)
**Core AI Features:**
* **Unstructured Input Processing:** Paste messy notes, meeting transcripts, or half-baked ideas; the AI engine parses and categorizes the information.
* **Executive Summary Generation:** Distills the core proposal.
* **Market Opportunity Analysis:** Assesses TAM/SAM/SOM and viability.
* **Competitor Analysis:** Identifies potential rivals and market positioning.
* **SWOT Analysis:** Structured Strengths, Weaknesses, Opportunities, and Threats mapping.
* **Revenue Model Strategy:** Proposes realistic monetization strategies.
* **Launch Plan:** Step-by-step go-to-market strategy.
* **Investor Pitch Generation:** Drafts professional cold emails/pitches ready to send to VCs.

**Core Application Features:**
* **History Management:** Automatically saves every generated evaluation to a local SQLite database.
* **Search Functionality:** Instant fuzzy-search through past startup ideas and notes.
* **Detailed View:** Click into past evaluations to read the full generated report.
* **Delete Functionality:** Remove old or unwanted evaluations from the database.

**UI/UX Features (Micro-interactions):**
* Apple-inspired premium minimalist design.
* Smooth page transitions and micro-animations using Framer Motion.
* Responsive, mobile-friendly layouts (Tailwind CSS).
* Real-time loading states while the AI processes data.
* Beautiful SVG icons (Lucide React).
* Data Visualization charts (Recharts) for analytics.
* Comprehensive error handling and Toast notifications on API failures.

---

## 🛠️ Tech Stack

**Frontend:**
* **Framework:** React 19 + Vite (TypeScript)
* **Styling:** Tailwind CSS (Utility-first CSS) + `clsx` & `tailwind-merge`
* **Animations:** Framer Motion
* **Routing:** React Router v7
* **Data Fetching:** Axios
* **Icons:** Lucide React
* **Charts:** Recharts

**Backend:**
* **Framework:** FastAPI (Python)
* **Database:** SQLite (via SQLAlchemy ORM)
* **AI Integration:** Google Gemini API (`google-genai` SDK)
* **Server:** Uvicorn
* **Middleware:** CORS Middleware for secure frontend connections

---

## 🧠 What You Can Learn From This Project

If you are studying this codebase, here are the key architectural and programming concepts you can master:

1. **Full-Stack Orchestration:** How to run and connect a Vite development server to a FastAPI python server, handling CORS and cross-origin data fetching.
2. **Generative AI Integration:** How to securely store API keys securely, prompt an LLM (Gemini) to return structured data, and handle situations where the AI hallucinates or fails.
3. **Structured outputs & JSON parsing:** How to force an LLM to output predictable JSON that a frontend can consume to populate UI components like a SWOT matrix.
4. **Relational Database Design:** Using SQLAlchemy to create tables (`models.py`), map them to Python classes, and securely query/insert data without writing raw SQL.
5. **Modern React Best Practices:** State management, component splitting, using generic components, and implementing responsive routing with React Router.
6. **Advanced UI Styling:** Using Tailwind to build glass-morphism effects, flex/grid layouts, and animating those components smoothly with Framer Motion.

---

## 📂 Project Structure

```text
ai-startup-evaluator/
│
├── backend/
│   ├── main.py             # FastAPI application entry point, routing, and CORS config
│   ├── models.py           # SQLAlchemy database schemas (The SQL Tables)
│   ├── schemas.py          # Pydantic models for data validation (The JSON validation)
│   ├── database.py         # SQLite connection setup and session maker
│   ├── ai_engine.py        # Gemini API integration and prompt engineering
│   ├── check_api_key.py    # Utility script to verify Gemini credentials
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx         # Main entry point 
│   │   ├── main.tsx        # React DOM rendering
│   │   ├── index.css       # Global styles and Tailwind directives
│   │   └── ... (Components and Pages)
│   ├── package.json        # NPM dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── vite.config.ts      # Vite bundler configuration
│
├── evaluation_test_plan.md # Systematic UI testing guide
└── README.md               # This file
```

---

## 🔌 API Endpoints & JSON Formatting

The backend exposes the following RESTful API endpoints. 

### 1. Health Check
* **GET** `/health`
* **Response:**
  ```json
  {
    "backend": "ok",
    "database": "ok",
    "gemini_api": true 
  }
  ```

### 2. Create Evaluation (The AI Engine)
* **POST** `/evaluate`
* **Request Body:**
  ```json
  {
    "idea": "A startup that delivers dog food using drones."
  }
  ```
* **Response:** Returns the full evaluation database record.

### 3. Fetch History
* **GET** `/history?skip=0&limit=100`
* **Response:** Array of Evaluation Objects.

### 4. Fetch Single Evaluation
* **GET** `/history/{evaluation_id}`
* **Response (Standard Evaluation Object representation used across the app):**
  ```json
  {
    "id": 1,
    "idea": "A startup that delivers dog food using drones.",
    "executive_summary": "DroneDog aims to revolutionize pet care...",
    "market_opportunity": "The US pet food market is $40B...",
    "competitor_analysis": "Competes with Chewy, traditional retail...",
    "swot_analysis": "Strengths: Fast delivery. Weaknesses: Drone regulation...",
    "revenue_model": "Subscription tiers based on food weight...",
    "launch_plan": "Phase 1: Pilot in suburban Austin...",
    "investor_pitch": "Subject: Revolutionizing Pet Food Delivery..."
  }
  ```

### 5. Search Evaluations
* **GET** `/search?q=drone`
* **Response:** Array of Evaluation Objects matching the query.

### 6. Delete Evaluation
* **DELETE** `/history/{evaluation_id}`
* **Response:**
  ```json
  {
    "message": "Deleted successfully"
  }
  ```
