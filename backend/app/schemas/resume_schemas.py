"""Resume schemas — request/response models for resume endpoints."""

from pydantic import BaseModel
from typing import List


class AnalyzeRequest(BaseModel):
    """Request body for ATS resume analysis."""
    resume_text: str
    jd_text: str


class ATSResult(BaseModel):
    """Response from the LLM ATS pipeline."""
    ats_score: int
    eligible: bool
    missing_skills: List[str]
    suggestions: List[str]
    interview_questions: List[str]
    extracted_skills: List[str]
