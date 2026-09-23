"""Career Vault model — the single source of truth for a candidate's career data."""

from beanie import Document, Indexed
from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


def to_camel(s: str) -> str:
    """Convert snake_case to camelCase for API payloads."""
    parts = s.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class APIBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")


class CustomField(APIBase):
    key: str = ""
    value: str = ""


class PersonalInfo(APIBase):
    full_name: str = ""
    headline: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""
    avatar: str = ""
    custom_fields: List[CustomField] = []


class VoiceSummary(APIBase):
    primary: str = ""
    target_roles: List[str] = []
    style: str = "Professional"


class ExperienceItem(APIBase):
    id: str = ""
    company: str = ""
    job_title: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    description: str = ""
    responsibilities: List[str] = []


class EducationItem(APIBase):
    id: str = ""
    institution: str = ""
    degree: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""


class ProjectItem(APIBase):
    id: str = ""
    name: str = ""
    technologies: str = ""
    start_date: str = ""
    url: str = ""
    link: str = ""
    github_url: str = ""
    description: str = ""
    highlights: List[str] = []


class SkillItem(APIBase):
    name: str = ""
    category: str = "Technical"
    proficiency: str = "Advanced"
    verified: bool = True
    evidence_level: str = "Strong"
    sources: List[Any] = []


class CertificationItem(APIBase):
    id: str = ""
    name: str = ""
    organization: str = ""
    issue_date: str = ""


class AchievementItem(APIBase):
    id: str = ""
    title: str = ""
    description: str = ""


class LanguageItem(APIBase):
    name: str = ""
    proficiency: str = ""


class PublicationItem(APIBase):
    id: str = ""
    title: str = ""
    venue: str = ""
    year: str = ""
    url: str = ""


class LinkItem(APIBase):
    label: str = ""
    url: str = ""


class CareerProfile(Document):
    """One document per user — every resume/ATS/match/interview reads from it."""

    user_id: Indexed(str, unique=True)
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: VoiceSummary = Field(default_factory=VoiceSummary)
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    skills: List[SkillItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[AchievementItem] = []
    languages: List[LanguageItem] = []
    publications: List[PublicationItem] = []
    links: List[LinkItem] = []
    open_source: List[Any] = []
    custom_sections: List[Any] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "career_profiles"

    def to_api_dict(self) -> dict:
        return {
            "id": str(self.id),
            "personalInfo": self.personal_info.model_dump(by_alias=True),
            "summary": self.summary.model_dump(by_alias=True),
            "experience": [e.model_dump(by_alias=True) for e in self.experience],
            "education": [e.model_dump(by_alias=True) for e in self.education],
            "projects": [p.model_dump(by_alias=True) for p in self.projects],
            "skills": [s.model_dump(by_alias=True) for s in self.skills],
            "certifications": [c.model_dump(by_alias=True) for c in self.certifications],
            "achievements": [a.model_dump(by_alias=True) for a in self.achievements],
            "languages": [l.model_dump(by_alias=True) for l in self.languages],
            "publications": [p.model_dump(by_alias=True) for p in self.publications],
            "links": [l.model_dump(by_alias=True) for l in self.links],
            "openSource": self.open_source,
            "customSections": self.custom_sections,
            "updatedAt": self.updated_at,
        }