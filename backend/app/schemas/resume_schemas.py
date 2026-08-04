"""Resume schemas — request/response models for resume endpoints."""

from pydantic import BaseModel, Field
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    """Request body for ATS resume analysis."""
    resume_text: str = Field(..., min_length=10, max_length=500_000)
    jd_text: str = Field(..., min_length=10, max_length=100_000)


class ATSResult(BaseModel):
    """Response from the LLM ATS pipeline."""
    id: Optional[str] = None
    ats_score: int
    eligible: bool
    missing_skills: List[str]
    suggestions: List[str]
    interview_questions: List[str]
    extracted_skills: List[str]
