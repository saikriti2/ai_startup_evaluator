from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from datetime import datetime
from database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    idea = Column(String, index=True)
    executive_summary = Column(Text)
    market_opportunity = Column(Text)
    competitor_analysis = Column(Text)
    swot_analysis = Column(Text)
    revenue_model = Column(Text)
    launch_plan = Column(Text)
    investor_pitch = Column(Text)
    financial_projections = Column(JSON, default={})
    roadmap = Column(JSON, default={})
    revenue_breakdown = Column(JSON, default={})
    market_size_breakdown = Column(JSON, default={})
    risks_and_mitigations = Column(JSON, default=[])
    team_requirements = Column(JSON, default={})
    success_metrics = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)