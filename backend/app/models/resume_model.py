"""Resume model — candidate's uploaded resume files."""

from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class Resume(Document):
    user_id: str
    original_filename: str
    text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "resumes"