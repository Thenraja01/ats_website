"""Resume Studio router — structured, versioned resumes, ATS re-checks and JD tailoring.

Versions are never overwritten: tailoring always clones into a new version.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.career_model import CareerProfile, to_camel
from app.models.resume_version_model import ResumeVersion, ATSRef, ResumeSection, render_resume_to_text
from app.models.application_model import Application
from app.services.ats_service import run_ats_pipeline
from app.services.match_service import match_resume_jd
from app.services.tailor_service import analyze_tailoring
from app.services.job_insights_service import analyze_jd

studio_router = APIRouter(prefix="/studio", tags=["Resume Studio"])

TEMPLATES = [
    {"id": "modern", "name": "Modern", "description": "Clean two-column layout with accent headings."},
    {"id": "minimal", "name": "Minimal", "description": "Single column, generous whitespace, timeless."},
    {"id": "professional", "name": "Professional", "description": "Balanced classic layout for corporate roles."},
    {"id": "technical", "name": "Technical", "description": "Skill-first layout built for engineering roles."},
    {"id": "executive", "name": "Executive", "description": "Leadership-forward layout with a strong summary."},
    {"id": "creative", "name": "Creative", "description": "Expressive styling for design and product roles."},
    {"id": "academic", "name": "Academic", "description": "Research, publications and teaching oriented."},
    {"id": "ats-classic", "name": "ATS Classic", "description": "Parsed-clean single column, maximum ATS compatibility."},
]


class ResumeCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    name: str = "Untitled Resume"
    version_number: int = 1
    template: str = "modern"
    role: str = ""
    headline: str = ""
    jd_title: Optional[str] = None
    jd_text: Optional[str] = None
    sections: List[dict] = []
    data: dict = {}


class ResumeUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    name: Optional[str] = None
    version_number: Optional[int] = None
    template: Optional[str] = None
    role: Optional[str] = None
    headline: Optional[str] = None
    jd_title: Optional[str] = None
    jd_text: Optional[str] = None
    status: Optional[str] = None
    sections: Optional[List[dict]] = None
    data: Optional[dict] = None


class TailorRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    resume_id: Optional[str] = None
    jd_text: str
    target_job_title: Optional[str] = None


class TailorCreateRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    source_resume_id: str
    name: str
    jd_title: str
    jd_text: str
    data: dict


async def _owned_resume(resume_id: str, user: User) -> ResumeVersion:
    resume = await ResumeVersion.get(resume_id)
    if not resume or resume.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


async def _get_vault(user: User) -> CareerProfile:
    profile = await CareerProfile.find_one(CareerProfile.user_id == str(user.id))
    if profile is None:
        profile = CareerProfile(user_id=str(user.id))
        await profile.insert()
    return profile


@studio_router.get("/templates")
async def list_templates():
    return TEMPLATES


@studio_router.get("/resumes")
async def list_resumes(user: User = Depends(require_roles(["candidate"]))):
    resumes = (
        await ResumeVersion.find(ResumeVersion.user_id == str(user.id))
        .sort(-ResumeVersion.created_at)
        .to_list()
    )
    return [r.to_api_dict() for r in resumes]


@studio_router.post("/resumes")
async def create_resume(payload: ResumeCreate, user: User = Depends(require_roles(["candidate"]))):
    sections = [ResumeSection.model_validate(s) for s in payload.sections or []]
    resume = ResumeVersion(
        user_id=str(user.id),
        name=payload.name or "Untitled Resume",
        version_number=payload.version_number,
        template=payload.template,
        role=payload.role,
        headline=payload.headline,
        jd_title=payload.jd_title,
        jd_text=payload.jd_text,
        sections=sections,
        data=payload.data or {},
    )
    await resume.insert()
    return resume.to_api_dict()


@studio_router.get("/resumes/{resume_id}")
async def get_resume(resume_id: str, user: User = Depends(require_roles(["candidate"]))):
    resume = await _owned_resume(resume_id, user)
    return resume.to_api_dict()


@studio_router.put("/resumes/{resume_id}")
async def update_resume(resume_id: str, payload: ResumeUpdate, user: User = Depends(require_roles(["candidate"]))):
    resume = await _owned_resume(resume_id, user)
    if payload.name is not None:
        resume.name = payload.name
    if payload.version_number is not None:
        resume.version_number = payload.version_number
    if payload.template is not None:
        resume.template = payload.template
    if payload.role is not None:
        resume.role = payload.role
    if payload.headline is not None:
        resume.headline = payload.headline
    if payload.jd_title is not None:
        resume.jd_title = payload.jd_title
    if payload.jd_text is not None:
        resume.jd_text = payload.jd_text
    if payload.status is not None:
        resume.status = payload.status
    if payload.sections is not None:
        resume.sections = [ResumeSection.model_validate(s) for s in payload.sections]
    if payload.data is not None:
        resume.data = payload.data
    resume.updated_at = datetime.utcnow()
    await resume.save()
    return resume.to_api_dict()


@studio_router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, user: User = Depends(require_roles(["candidate"]))):
    resume = await _owned_resume(resume_id, user)
    await resume.delete()
    return {"message": "Resume deleted"}


@studio_router.post("/resumes/{resume_id}/duplicate")
async def duplicate_resume(resume_id: str, user: User = Depends(require_roles(["candidate"]))):
    resume = await _owned_resume(resume_id, user)
    latest = (
        await ResumeVersion.find(ResumeVersion.user_id == str(user.id))
        .sort(-ResumeVersion.version_number)
        .first_or_none()
    )
    next_number = (latest.version_number if latest else 0) + 1
    copy = ResumeVersion(
        user_id=str(user.id),
        name=f"{resume.name} (copy)",
        version_number=next_number,
        template=resume.template,
        role=resume.role,
        headline=resume.headline,
        jd_title=resume.jd_title,
        jd_text=resume.jd_text,
        status=resume.status,
        source_resume_id=str(resume.id),
        sections=[s.model_copy(deep=True) for s in resume.sections],
        data=resume.data,
    )
    await copy.insert()
    return copy.to_api_dict()


@studio_router.post("/resumes/{resume_id}/ats")
async def analyze_resume_ats(resume_id: str, user: User = Depends(require_roles(["candidate"]))):
    resume = await _owned_resume(resume_id, user)
    resume_text = render_resume_to_text(resume)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume has no content to analyze yet")

    jd_text = resume.jd_text or ""
    result = run_ats_pipeline(resume_text, jd_text)
    resume.ats = ATSRef(
        score=result["ats_score"],
        eligible=result["eligible"],
        missing_skills=result["missing_skills"],
        suggestions=result["suggestions"],
        analyzed_at=datetime.utcnow(),
    )
    resume.status = "ready"
    resume.updated_at = datetime.utcnow()
    await resume.save()
    return resume.to_api_dict()


@studio_router.post("/analyze-jd")
async def analyze_jd_text(payload: dict, user: User = Depends(require_roles(["candidate"]))):
    jd_text = payload.get("jd_text", "")
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    return analyze_jd(jd_text)


@studio_router.post("/match")
async def match_resume(payload: dict, user: User = Depends(require_roles(["candidate"]))):
    """Match a resume version (or raw resume text) against a JD."""
    resume_text = payload.get("resume_text", "")
    resume_id = payload.get("resume_id")
    jd_text = payload.get("jd_text", "")

    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    if resume_id:
        resume = await _owned_resume(resume_id, user)
        resume_text = render_resume_to_text(resume)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume has no content to match")

    insights = analyze_jd(jd_text)
    return match_resume_jd(resume_text, jd_text, insights["requiredSkills"], insights["preferredSkills"])


@studio_router.post("/tailor/assess")
async def assess_tailoring(payload: TailorRequest, user: User = Depends(require_roles(["candidate"]))):
    """Compare Career Vault + resume against a JD and produce safe vs verification-required changes."""
    jd_text = payload.jd_text
    if not jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    vault = await _get_vault(user)
    insights = analyze_jd(jd_text)

    if payload.resume_id:
        resume = await _owned_resume(payload.resume_id, user)
        resume_text = render_resume_to_text(resume)
        match = match_resume_jd(resume_text, jd_text, insights["requiredSkills"], insights["preferredSkills"])
    else:
        resume = None
        resume_text = ""
        match = match_resume_jd(_vault_blob(vault), jd_text, insights["requiredSkills"], insights["preferredSkills"])

    assessment = analyze_tailoring(vault, resume_text, jd_text, insights["requiredSkills"])

    return {
        "jdInsights": insights,
        "match": match,
        "safeImprovements": assessment["safeImprovements"],
        "requiresVerification": assessment["requiresVerification"],
        "resumeId": str(resume.id) if resume else None,
    }


@studio_router.post("/tailor/create")
async def create_tailored_version(payload: TailorCreateRequest, user: User = Depends(require_roles(["candidate"]))):
    """Create a new tailored version from an existing resume. Original is never overwritten."""
    source = await _owned_resume(payload.source_resume_id, user)
    latest = (
        await ResumeVersion.find(ResumeVersion.user_id == str(user.id))
        .sort(-ResumeVersion.version_number)
        .first_or_none()
    )
    next_number = (latest.version_number if latest else 0) + 1

    sections = [s.model_copy(deep=True) for s in source.sections]
    new_version = ResumeVersion(
        user_id=str(user.id),
        name=payload.name or f"Tailored — {payload.jd_title}",
        version_number=next_number,
        template=source.template,
        role=source.role,
        headline=source.headline,
        jd_title=payload.jd_title,
        jd_text=payload.jd_text,
        status="draft",
        source_resume_id=str(source.id),
        provenance=[*source.provenance, {"type": "jd_tailor", "job": payload.jd_title, "at": datetime.utcnow().isoformat()}],
        sections=sections,
        data=payload.data or source.data,
    )
    await new_version.insert()

    # Re-run ATS against the tailored JD
    resume_text = render_resume_to_text(new_version)
    if resume_text.strip():
        result = run_ats_pipeline(resume_text, payload.jd_text)
        new_version.ats = ATSRef(
            score=result["ats_score"],
            eligible=result["eligible"],
            missing_skills=result["missing_skills"],
            suggestions=result["suggestions"],
            analyzed_at=datetime.utcnow(),
        )
        new_version.status = "ready"
        await new_version.save()

    return new_version.to_api_dict()


def _vault_blob(vault: CareerProfile) -> str:
    parts = [vault.personal_info.full_name, vault.personal_info.headline]
    for e in vault.experience:
        parts.extend([e.company, e.job_title, e.description, *e.responsibilities])
    for p in vault.projects:
        parts.extend([p.name, p.technologies, p.description])
    for s in vault.skills:
        parts.append(s.name if isinstance(s.name, str) else "")
    return " ".join(str(p) for p in parts if p)