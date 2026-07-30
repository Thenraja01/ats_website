"""Analysis Result model — persisted ATS analysis results."""

from beanie import Document
from datetime import datetime
from typing import List, Optional
from pydantic import Field


class AnalysisResult(Document):
    user_id: Optional[str] = None  # None for guests
    ip_address: Optional[str] = None
    role: str  # "guest", "candidate", "recruiter"
    resume_text: str
    jd_text: str
    ats_score: int
    eligible: bool
    missing_skills: List[str] = []
    suggestions: List[str] = []
    interview_questions: List[str] = []
    extracted_skills: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "analysis_results"