"""Resume schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ResumeUpload(BaseModel):
    """Resume upload schema."""

    name: str
    email: str
    job_description: Optional[str] = None
    job_id: int = 1


class ResumeResponse(BaseModel):
    """Resume response schema."""

    id: str
    name: str
    email: str
    filename: str
    job_description: Optional[str] = None
    uploaded_at: str


class ResumeAnalysis(BaseModel):
    """Resume analysis result schema."""

    resume_id: str
    score: float = Field(..., ge=0, le=100)
    feedback: str
    scores: Dict[str, float]
    resume_text: str
    keywords_matched: List[str] = []
    keywords_missing: List[str] = []
