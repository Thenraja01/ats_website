"""Job Description model."""

from beanie import Document
from datetime import datetime
from typing import List, Optional
from pydantic import Field


class JobDescription(Document):
    user_id: str
    organization_id: Optional[str] = None
    title: str
    description: str
    required_skills: List[str] = []
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    responsibilities: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "job_descriptions"