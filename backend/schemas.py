from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class EvaluationBase(BaseModel):
    idea: str

class EvaluationCreate(EvaluationBase):
    pass

class Evaluation(EvaluationBase):
    id: int
    executive_summary: str
    market_opportunity: str
    competitor_analysis: str
    swot_analysis: str
    revenue_model: str
    launch_plan: str
    investor_pitch: str
    financial_projections: Optional[Dict[str, Any]] = {}
    roadmap: Optional[Dict[str, Any]] = {}
    revenue_breakdown: Optional[Dict[str, str]] = {}
    market_size_breakdown: Optional[Dict[str, str]] = {}
    risks_and_mitigations: Optional[List[Dict[str, Any]]] = []
    team_requirements: Optional[Dict[str, str]] = {}
    success_metrics: Optional[List[str]] = []
    created_at: datetime

    class Config:
        from_attributes = True