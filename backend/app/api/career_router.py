"""Career Vault router — single source of truth for user career data.

Spec: HireMind AI — one user type (USER). All data ownership via user_id
from authenticated JWT. No RBAC, no role checking.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timezone

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.career_model import CareerProfile, PersonalInfo, VoiceSummary

career_router = APIRouter(prefix="/career", tags=["Career Vault"])


async def get_or_create_profile(user_id: str) -> CareerProfile:
    profile = await CareerProfile.find_one(CareerProfile.user_id == user_id)
    if profile is None:
        profile = CareerProfile(user_id=user_id)
        await profile.insert()
    return profile


@career_router.get("")
async def get_profile(user: User = Depends(get_current_user)):
    profile = await get_or_create_profile(str(user.id))
    return profile.to_api_dict()


@career_router.put("")
async def update_profile(
    payload: dict,
    user: User = Depends(get_current_user),
):
    profile = await get_or_create_profile(str(user.id))

    personal = payload.get("personalInfo")
    if personal is not None:
        profile.personal_info = PersonalInfo.model_validate(personal)
    summary = payload.get("summary")
    if summary is not None:
        if isinstance(summary, str):
            profile.summary = VoiceSummary(primary=summary)
        else:
            profile.summary = VoiceSummary.model_validate(summary)

    for field in [
        "experience", "education", "projects", "skills", "certifications",
        "achievements", "languages", "publications", "links",
        "openSource", "customSections",
    ]:
        if field in payload:
            setattr(profile, field, payload[field])

    profile.updated_at = datetime.now(timezone.utc)
    await profile.save()
    return profile.to_api_dict()


@career_router.patch("/section/{section}")
async def update_section(
    section: str,
    payload: list | dict,
    user: User = Depends(get_current_user),
):
    allowed = {
        "personal": "personal_info",
        "summary": "summary",
        "experience": "experience",
        "education": "education",
        "projects": "projects",
        "skills": "skills",
        "certifications": "certifications",
        "achievements": "achievements",
        "languages": "languages",
        "publications": "publications",
        "links": "links",
        "open-source": "open_source",
        "custom-sections": "custom_sections",
    }
    if section not in allowed:
        raise HTTPException(status_code=404, detail=f"Unknown section: {section}")

    profile = await get_or_create_profile(str(user.id))
    target = allowed[section]

    if target == "personal_info":
        profile.personal_info = PersonalInfo.model_validate(payload if isinstance(payload, dict) else payload[0] if isinstance(payload, list) and payload else {})
    elif target == "summary":
        profile.summary = VoiceSummary.model_validate(payload) if isinstance(payload, dict) else VoiceSummary(primary=str(payload))
    else:
        setattr(profile, target, payload)

    profile.updated_at = datetime.now(timezone.utc)
    await profile.save()
    return {"ok": True, "section": section, "profile": profile.to_api_dict()}


@career_router.get("/completion")
async def completion(user: User = Depends(get_current_user)):
    profile = await get_or_create_profile(str(user.id))

    def filled(value) -> bool:
        if isinstance(value, str):
            return bool(value.strip())
        if isinstance(value, list):
            return len(value) > 0
        if isinstance(value, dict):
            return bool(value)
        return bool(value)

    sections = {
        "personalInfo": {
            "filled": sum(filled(getattr(profile.personal_info, f)) for f in [
                "full_name", "headline", "email", "phone", "location",
            ]),
            "total": 5,
        },
        "summary": {
            "filled": 1 if filled(profile.summary.primary) else 0,
            "total": 1,
        },
        "experience": {"filled": len(profile.experience), "total": 3},
        "education": {"filled": len(profile.education), "total": 1},
        "projects": {"filled": len(profile.projects), "total": 1},
        "skills": {"filled": len(profile.skills), "total": 3},
        "certifications": {"filled": len(profile.certifications), "total": 1},
        "languages": {"filled": len(profile.languages), "total": 1},
    }

    weights = {
        "personalInfo": 20, "summary": 15, "experience": 25, "education": 10,
        "projects": 10, "skills": 20, "certifications": 5, "languages": 5,
    }
    scored = {}
    total = sum(weights.values())
    overall = 0
    for key, info in sections.items():
        ratio = min(1.0, info["filled"] / max(info["total"], 1))
        sub = round(ratio * 100)
        scored[key] = {"score": sub, "filled": info["filled"], "total": info["total"]}
        overall += sub * weights[key]

    return {
        "completion": round(overall / max(total, 1)),
        "sections": scored,
    }