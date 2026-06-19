from sqlalchemy import Column, Integer, String, Text, DateTime
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
    created_at = Column(DateTime, default=datetime.utcnow)
