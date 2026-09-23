"""Application model — candidate applications to job descriptions with a full lifecycle timeline."""

from beanie import Document
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

from app.models.career_model import to_camel

# Full candidate-facing status lifecycle
APPLICATION_STATUSES = [
    "applied",
    "screening",
    "interview",
    "technical",
    "offer",
    "rejected",
    "withdrawn",
]


class TimelineEvent(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    status: str = "applied"
    note: str = ""
    at: datetime = Field(default_factory=datetime.utcnow)


class Application(Document):
    job_id: str
    candidate_id: str
    resume_text: str
    ats_score: int = 0
    eligible: bool = False
    analysis_id: Optional[str] = None
    resume_version_id: Optional[str] = None
    jd_match: Optional[int] = None
    company: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_url: Optional[str] = None
    status: str = "applied"
    timeline: List[TimelineEvent] = []
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "applications"

    def to_api_dict(self, job_title: str = "General Application") -> dict:
        return {
            "id": str(self.id),
            "job_id": self.job_id,
            "job_title": job_title,
            "ats_score": self.ats_score,
            "eligible": self.eligible,
            "analysis_id": self.analysis_id,
            "resume_version_id": self.resume_version_id,
            "jd_match": self.jd_match,
            "company": self.company,
            "role": self.role,
            "location": self.location,
            "salary": self.salary,
            "job_url": self.job_url,
            "status": self.status,
            "timeline": [t.model_dump(by_alias=True) for t in self.timeline],
            "notes": self.notes,
            "created_at": self.created_at,
        }