"""Interview models — question bank, mock sessions, and evidence-based feedback."""

from beanie import Document, Indexed
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.career_model import to_camel


class InterviewQuestion(Document):
    """A reusable interview question. System questions are seeded; users can add/save custom ones."""

    user_id: Optional[str] = None  # None for the system-seeded bank
    category: str = "Technical"  # Frontend|Backend|Database|AI/ML|RAG|DevOps|System Design|Behavioral|HR|Project
    difficulty: str = "Intermediate"  # Beginner|Intermediate|Advanced
    question: str
    ideal_answer: str = ""
    keywords: List[str] = []
    tags: List[str] = []
    is_custom: bool = False
    saved: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "interview_questions"

    def to_api_dict(self) -> dict:
        return {
            "id": str(self.id),
            "category": self.category,
            "difficulty": self.difficulty,
            "question": self.question,
            "idealAnswer": self.ideal_answer,
            "keywords": self.keywords,
            "tags": self.tags,
            "isCustom": self.is_custom,
            "saved": self.saved,
            "createdAt": self.created_at,
        }


class QuestionRef(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    id: str
    question: str
    category: str = "Technical"
    difficulty: str = "Intermediate"
    ideal_answer: str = ""
    keywords: List[str] = []
    user_answer: str = ""
    feedback: Optional[dict] = None


class SessionFeedback(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    communication: int = 0
    technical_coverage: int = 0
    answer_structure: int = 0
    overall: int = 0
    strengths: List[str] = []
    improvements: List[str] = []


class SavedQuestion(Document):
    """Per-user saved state for a question (system bank or custom)."""

    user_id: str
    question_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "saved_questions"


class InterviewSession(Document):
    user_id: Indexed(str)
    title: str = "Mock Interview"
    session_type: str = "mock"  # mock | project | category
    job_title: str = ""
    resume_version_id: Optional[str] = None
    status: str = "in_progress"  # in_progress | completed
    current_index: int = 0
    questions: List[QuestionRef] = []
    feedback: Optional[SessionFeedback] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "interview_sessions"

    def to_api_dict(self, include_answers: bool = True) -> dict:
        questions = []
        for q in self.questions:
            payload = q.model_dump(by_alias=True)
            if not include_answers:
                payload.pop("userAnswer", None)
            questions.append(payload)
        return {
            "id": str(self.id),
            "title": self.title,
            "sessionType": self.session_type,
            "jobTitle": self.job_title,
            "resumeVersionId": self.resume_version_id,
            "status": self.status,
            "currentIndex": self.current_index,
            "questions": questions,
            "feedback": self.feedback.model_dump(by_alias=True) if self.feedback else None,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }