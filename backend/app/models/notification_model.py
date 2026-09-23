"""Notification model — in-app activity notifications for the workspace."""

from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class Notification(Document):
    user_id: str
    type: str = "info"  # info | success | warning | interview | application | resume | ai
    title: str
    message: str = ""
    link: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "notifications"

    def to_api_dict(self) -> dict:
        return {
            "id": str(self.id),
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "link": self.link,
            "read": self.read,
            "createdAt": self.created_at,
        }