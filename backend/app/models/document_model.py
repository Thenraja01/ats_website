"""Documents model — user documents organized by category with version history."""

from beanie import Document
from datetime import datetime
from typing import List, Optional
from pydantic import Field


class DocumentRecord(Document):
    user_id: str
    category: str = "Resume"  # Resume|Certificate|Job Description|Cover Letter|Offer Letter|Portfolio|Other
    name: str = "Untitled"
    description: str = ""
    filename: Optional[str] = None
    file_type: str = "note"  # note | link | file
    size: Optional[int] = None
    url: Optional[str] = None
    version: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "documents"

    def to_api_dict(self) -> dict:
        return {
            "id": str(self.id),
            "category": self.category,
            "name": self.name,
            "description": self.description,
            "filename": self.filename,
            "fileType": self.file_type,
            "size": self.size,
            "url": self.url,
            "version": self.version,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }