from pydantic import BaseModel
from typing import List, Optional

from beanie import Document
from datetime import datetime

class Upload(Document):
    user_id: str | None
    guest_ip: str | None
    role: str
    filename: str
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "uploads"
class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

class ATSResult(BaseModel):
    ats_score: int
    eligible: bool
    missing_skills: List[str]
    suggestions: List[str]
    interview_questions: List[str]
    extracted_skills: List[str]
