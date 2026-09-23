"""Resume Studio version model — structured, versioned resumes built from the Career Vault."""

from beanie import Document, Indexed
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict

from app.models.career_model import to_camel


class ResumeSection(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    key: str
    title: str = ""
    type: str = "bullets"  # bullets | text | items
    order: int = 0
    content: Any = None


class ATSRef(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    score: int = 0
    eligible: bool = False
    missing_skills: List[str] = []
    suggestions: List[str] = []
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeVersion(Document):
    """A single saved version of a resume. Versions are never overwritten — tailoring
    always produces a new document."""

    user_id: Indexed(str)
    name: str = "Untitled Resume"
    version_number: int = 1
    template: str = "modern"
    role: str = ""
    headline: str = ""
    jd_title: Optional[str] = None
    jd_text: Optional[str] = None
    status: str = "draft"  # draft | ready | exported
    source_resume_id: Optional[str] = None
    provenance: List[dict] = []
    sections: List[ResumeSection] = []
    data: dict = {}
    ats: Optional[ATSRef] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "resume_versions"

    def to_api_dict(self) -> dict:
        return {
            "id": str(self.id),
            "name": self.name,
            "versionNumber": self.version_number,
            "template": self.template,
            "role": self.role,
            "headline": self.headline,
            "jdTitle": self.jd_title,
            "jdText": self.jd_text,
            "status": self.status,
            "sourceResumeId": self.source_resume_id,
            "provenance": self.provenance,
            "sections": [s.model_dump(by_alias=True) for s in self.sections],
            "data": self.data,
            "ats": self.ats.model_dump(by_alias=True) if self.ats else None,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }


def render_resume_to_text(version) -> str:
    """Render a ResumeVersion into plain text for ATS/JD analysis."""
    lines = []
    if version.headline:
        lines.append(version.headline)
    data = version.data or {}
    personal = data.get("personalInfo", {})
    if personal.get("fullName"):
        lines.append(personal.get("fullName", ""))
    if personal.get("email"):
        lines.append(personal.get("email", ""))
    if personal.get("phone"):
        lines.append(personal.get("phone", ""))
    if personal.get("location"):
        lines.append(personal.get("location", ""))

    def render_list(items, joined=", "):
        try:
            if isinstance(items, list):
                return joined.join(str(i) for i in items if i)
        except TypeError:
            pass
        return ""

    for section in sorted(version.sections, key=lambda s: s.order):
        lines.append("")
        lines.append(section.title or section.key.replace("_", " ").title())
        content = section.content
        if isinstance(content, list):
            for item in content:
                if isinstance(item, dict):
                    name = item.get("title") or item.get("name") or item.get("company") or item.get("position") or ""
                    desc = item.get("description") or item.get("summary") or ""
                    extra = render_list(
                        item.get("bullets") or item.get("responsibilities") or item.get("technologies")
                    )
                    lines.append(f"- {name} {desc}".strip())
                    if extra:
                        lines.append(f"  {extra}")
                elif item:
                    lines.append(f"- {item}")
        elif content:
            lines.append(str(content))

    if data.get("skills"):
        skills = data.get("skills")
        if isinstance(skills, list):
            names = [s.get("name", s) if isinstance(s, dict) else s for s in skills]
            lines.append("")
            lines.append("Skills")
            lines.append(render_list(names))

    return "\n".join(str(line) for line in lines if line is not None)