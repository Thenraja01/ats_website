"""Beanie Document model for dynamic, code-free Resume Templates."""

from beanie import Document, Indexed
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pydantic import Field


class ResumeTemplate(Document):
    """A published or draft resume template stored in MongoDB with full declarative layout AST."""

    slug: Indexed(str, unique=True)
    title: str
    description: str
    category: Indexed(str) = "general"
    tags: List[str] = []
    visibility: Indexed(str) = "public"  # "public" | "private"
    author_id: Optional[str] = None
    is_premium: bool = False

    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    definition_url: Optional[str] = None

    typography: Dict[str, Any] = {}
    palette: Dict[str, Any] = {}
    layout: Dict[str, Any] = {}

    ats_score_rating: int = 95
    usage_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "resume_templates"

    def to_api_dict(self, current_user_id: Optional[str] = None) -> dict:
        return {
            "id": str(self.id),
            "slug": self.slug,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "tags": self.tags,
            "visibility": self.visibility,
            "authorId": self.author_id,
            "isOwner": bool(current_user_id and self.author_id == current_user_id),
            "isPremium": self.is_premium,
            "atsScoreRating": self.ats_score_rating,
            "thumbnailUrl": self.thumbnail_url,
            "previewUrl": self.preview_url,
            "typography": self.typography,
            "palette": self.palette,
            "layout": self.layout,
            "usageCount": self.usage_count,
            "createdAt": self.created_at.isoformat() if self.created_at else "",
            "updatedAt": self.updated_at.isoformat() if self.updated_at else "",
        }
