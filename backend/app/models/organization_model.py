"""Organization model."""

from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class Organization(Document):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    admin_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "organizations"