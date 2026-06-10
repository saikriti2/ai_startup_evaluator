from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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
    created_at: datetime

    class Config:
        from_attributes = True
