"""Application model — candidate applications to job descriptions."""

from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class Application(Document):
    job_id: str
    candidate_id: str
    resume_text: str
    ats_score: int
    eligible: bool
    analysis_id: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "applications"