"""ATS scoring schemas."""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class ATSScoreRequest(BaseModel):
    """ATS scoring request schema."""

    resume_text: str
    job_description: str
    job_id: Optional[int] = 1


class ATSScoreResponse(BaseModel):
    """ATS scoring response schema."""

    final_score: float = Field(..., ge=0, le=100)
    skills_match: float
    experience_match: float
    internship_match: float
    certificates_match: float
    projects_match: float
    education_match: float
    feedback: str
    suggestions: List[str] = []
    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
