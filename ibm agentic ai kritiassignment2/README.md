# ABC Technologies Customer Support Automation

This project implements an AI-powered customer support workflow for ABC
Technologies using LangGraph. It classifies customer queries, routes them to the
right support department, retrieves relevant knowledge base context, stores
conversation memory in SQLite, sends high-risk requests to a human supervisor,
and generates a final customer response.

## Features

- LangGraph workflow with conditional routing.
- Intent classification for Sales, Technical Support, Billing, Account, Memory,
  and Unknown requests.
- Specialized department agents.
- RAG-style knowledge retrieval from company documents in `docs/`.
- SQLite memory in `memory/memory.db`.
- Human-in-the-loop approval for refunds, cancellations, account closure,
  compensation, and management escalation.
- Supervisor node that validates and finalizes responses.
- Demonstration mode for the five required sample queries.

## Project Structure

```text
CustomerSupport/
├── app.py
├── graph.py
├── state.py
├── requirements.txt
├── agents/
│   ├── account.py
│   ├── billing.py
│   ├── common.py
│   ├── human.py
│   ├── intent.py
│   ├── sales.py
│   ├── supervisor.py
│   └── technical.py
├── docs/
│   ├── company_policy.txt
│   ├── faq.txt
│   ├── pricing_guide.txt
│   ├── technical_manual.txt
│   └── REPORT.md
├── diagrams/
│   ├── WORKFLOW_DIAGRAM.txt
│   └── WORKFLOW_DIAGRAM.png
├── memory/
│   ├── schema.sql
│   ├── sqlite_memory.py
│   └── memory.db
└── rag/
    ├── loader.py
    ├── retriever.py
    └── vectorstore.py
```

## Setup

Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

No API key, Ollama model, or internet connection is required for the demo.

## Run The Required Demo

```bash
python app.py --demo
```

The demo runs these five queries for customer `David`:

1. What are the pricing plans available for your software?
2. I forgot my account password.
3. My application crashes whenever I upload a file.
4. I need a refund for my annual subscription.
5. What was my previous support issue?

For the demo, the refund request is automatically approved by setting
`HUMAN_APPROVAL_DECISION=yes`.

## Run Interactive Mode

```bash
python app.py
```

For high-risk requests, the terminal asks:

```text
Supervisor approval required for Refund request. Approve? (yes/no):
```

You can also set a decision before running:

```bash
$env:HUMAN_APPROVAL_DECISION="yes"
python app.py
```

## Workflow

```text
Customer Query
  -> Intent Classification
  -> Memory Recall? yes -> SQLite Memory -> Supervisor -> Save -> End
  -> RAG Retrieval
  -> Conditional Department Routing
       -> Sales Agent
       -> Technical Support Agent
       -> Billing Agent
       -> Account Agent
  -> Human Approval? yes -> Human Approval
  -> Supervisor
  -> Save Conversation To SQLite
  -> Final Response
```

## SQLite Memory

The database is created automatically at `memory/memory.db`.

Schema:

```sql
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    query TEXT NOT NULL,
    intent TEXT NOT NULL DEFAULT 'Unknown',
    department TEXT NOT NULL DEFAULT '',
    response TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
```

## Submission Checklist Mapping

- Source code: project Python files.
- README: this file.
- Workflow diagram: `diagrams/WORKFLOW_DIAGRAM.txt` and existing PNG.
- Knowledge base documents: `docs/*.txt`.
- Documentation report: `docs/REPORT.md`.
- SQLite file/schema: `memory/memory.db` and `memory/schema.sql`.
- Task output screenshots: run `python app.py --demo` and capture the execution
  trace sections for routing, RAG retrieval, human approval, memory recall, and
  final response generation.
