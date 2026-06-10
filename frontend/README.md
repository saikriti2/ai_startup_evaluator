# 🚀 AI Startup Evaluator

An AI-powered full-stack web app that evaluates startup ideas and generates a comprehensive business report — including market analysis, SWOT, revenue model, launch plan, and an investor pitch email.

---

## 🧱 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18 + TypeScript + Vite        |
| Backend  | FastAPI + Python 3.10+              |
| AI       | Google Gemini API (`gemini-pro`)    |
| Database | SQLite via SQLAlchemy               |
| Styling  | Inline CSS (dark theme)             |

---

## 📁 Project Structure

```
project-root/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── ai_engine.py     # Gemini API integration
│   ├── models.py        # SQLAlchemy DB models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # DB engine & session setup
│   ├── requirements.txt # Python dependencies
│   └── tests/
│       └── test_main.py # Pytest test suite
├── src/
│   └── App.tsx          # React frontend (single-page)
├── index.html
├── vite.config.ts
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be live at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# From project root
npm install
npm run dev
```

The frontend will be live at: `http://localhost:5173`

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | `/evaluate`               | Submit an idea, get full report    |
| GET    | `/history`                | List all past evaluations          |
| GET    | `/history/{id}`           | Get a single evaluation by ID      |
| GET    | `/search?q={query}`       | Search evaluations by idea keyword |
| DELETE | `/history/{id}`           | Delete an evaluation               |

### Example Request

```bash
curl -X POST http://localhost:8000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"idea": "An AI tool that turns meeting notes into action items automatically"}'
```

### Example Response

```json
{
  "id": 1,
  "idea": "An AI tool that turns meeting notes into action items automatically",
  "executive_summary": "...",
  "market_opportunity": "...",
  "competitor_analysis": "...",
  "swot_analysis": "...",
  "revenue_model": "...",
  "launch_plan": "...",
  "investor_pitch": "...",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## 🧪 Running Tests

```bash
cd backend
pytest tests/test_main.py -v
```

Tests cover:
- Health/root route
- Idea evaluation (mocked AI, no API key needed)
- Evaluation history retrieval
- Search by keyword
- Fetch by ID (valid + 404 case)
- Delete by ID

---

## 🌐 Environment Variables

| Variable         | Required | Description                        |
|------------------|----------|------------------------------------|
| `GEMINI_API_KEY` | No*      | Google Gemini API key              |

> *If not provided, the app falls back to mock responses — useful for local dev and testing.

---

## ✨ Features

- 📋 **Full evaluation report** — executive summary, market opportunity, competitor analysis, SWOT, revenue model, launch plan
- 📧 **Investor pitch email** — auto-generated, ready to copy/send
- 📋 **Clipboard copy** — one-click copy via Clipboard API
- 🔄 **Regenerate** — re-run AI analysis on the same idea
- 🗄️ **Persistent history** — all evaluations saved to SQLite
- 🔍 **Search** — find past evaluations by keyword

---

## 📝 License

MIT