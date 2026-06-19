from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, database, ai_engine
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Premium AI Startup Evaluator API")

# Enable CORS properly (allow_credentials cannot be True if allow_origins is "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health / Status ─────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Check backend health and Gemini API connectivity."""
    gemini_status = await ai_engine.test_api_connection()
    return {
        "backend": "ok",
        "database": "ok",
        "gemini_api": gemini_status,
    }

# ── Evaluation ──────────────────────────────────────────────────────────────

@app.post("/evaluate", response_model=schemas.Evaluation)
async def create_evaluation(request: schemas.EvaluationCreate, db: Session = Depends(get_db)):
    report = await ai_engine.evaluate_idea(request.idea)

    db_evaluation = models.Evaluation(
        idea=request.idea,
        executive_summary=report.get("executive_summary", ""),
        market_opportunity=report.get("market_opportunity", ""),
        competitor_analysis=report.get("competitor_analysis", ""),
        swot_analysis=report.get("swot_analysis", ""),
        revenue_model=report.get("revenue_model", ""),
        launch_plan=report.get("launch_plan", ""),
        investor_pitch=report.get("investor_pitch", ""),
    )

    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

# ── History ─────────────────────────────────────────────────────────────────

@app.get("/history", response_model=List[schemas.Evaluation])
def read_evaluations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Evaluation).order_by(models.Evaluation.id.desc()).offset(skip).limit(limit).all()

@app.get("/history/{evaluation_id}", response_model=schemas.Evaluation)
def read_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    db_eval = db.query(models.Evaluation).filter(models.Evaluation.id == evaluation_id).first()
    if db_eval is None:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return db_eval

@app.delete("/history/{evaluation_id}")
def delete_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    db_eval = db.query(models.Evaluation).filter(models.Evaluation.id == evaluation_id).first()
    if db_eval:
        db.delete(db_eval)
        db.commit()
    return {"message": "Deleted successfully"}

# ── Search ───────────────────────────────────────────────────────────────────

@app.get("/search", response_model=List[schemas.Evaluation])
def search_evaluations(q: str, db: Session = Depends(get_db)):
    return (
        db.query(models.Evaluation)
        .filter(models.Evaluation.idea.contains(q))
        .order_by(models.Evaluation.id.desc())
        .all()
    )
