"""Job Application Tracker router — Personal application tracking for individual users.

Spec: HireMind AI — one user type (USER). All data ownership via user_id from JWT.
Supports Kanban statuses: saved, applied, screening, interview, technical, offer, rejected, withdrawn.
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.application_model import Application, TimelineEvent
from app.models.career_model import to_camel

applications_router = APIRouter(prefix="/applications", tags=["Applications"])


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    company: str
    role: str
    job_id: Optional[str] = "custom"
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    status: str = "applied"
    resume_version_id: Optional[str] = None
    resume_text: Optional[str] = ""
    ats_score: Optional[int] = 0
    jd_match: Optional[int] = 0
    notes: Optional[str] = ""


class ApplicationUpdate(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    company: Optional[str] = None
    role: Optional[str] = None
    job_url: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    status: Optional[str] = None
    resume_version_id: Optional[str] = None
    ats_score: Optional[int] = None
    jd_match: Optional[int] = None
    notes: Optional[str] = None


@applications_router.get("")
async def list_applications(
    status: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
):
    user_id = str(user.id)
    query = (Application.candidate_id == user_id) | (Application.job_id == user_id)
    apps = await Application.find(query).sort(-Application.created_at).to_list()
    
    if status and status != "all":
        apps = [a for a in apps if a.status.lower() == status.lower()]

    return [a.to_api_dict(job_title=a.role or "Job Application") for a in apps]


@applications_router.post("")
async def create_application(
    payload: ApplicationCreate,
    user: User = Depends(get_current_user),
):
    user_id = str(user.id)
    now = datetime.now(timezone.utc)
    
    app = Application(
        candidate_id=user_id,
        job_id=payload.job_id or "custom",
        company=payload.company,
        role=payload.role,
        job_url=payload.job_url,
        location=payload.location,
        salary=payload.salary,
        status=payload.status or "applied",
        resume_version_id=payload.resume_version_id,
        resume_text=payload.resume_text or "",
        ats_score=payload.ats_score or 0,
        jd_match=payload.jd_match or 0,
        notes=payload.notes or "",
        timeline=[
            TimelineEvent(
                status=payload.status or "applied",
                note="Application created",
                at=now,
            )
        ],
        created_at=now,
    )
    await app.insert()
    return app.to_api_dict(job_title=app.role or "Job Application")


@applications_router.get("/{app_id}")
async def get_application(
    app_id: str,
    user: User = Depends(get_current_user),
):
    user_id = str(user.id)
    app = await Application.get(app_id)
    if not app or (app.candidate_id != user_id and app.job_id != user_id):
        raise HTTPException(status_code=404, detail="Application not found")
    return app.to_api_dict(job_title=app.role or "Job Application")


@applications_router.put("/{app_id}")
async def update_application(
    app_id: str,
    payload: ApplicationUpdate,
    user: User = Depends(get_current_user),
):
    user_id = str(user.id)
    app = await Application.get(app_id)
    if not app or (app.candidate_id != user_id and app.job_id != user_id):
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    if payload.company is not None:
        app.company = payload.company
    if payload.role is not None:
        app.role = payload.role
    if payload.job_url is not None:
        app.job_url = payload.job_url
    if payload.location is not None:
        app.location = payload.location
    if payload.salary is not None:
        app.salary = payload.salary
    if payload.resume_version_id is not None:
        app.resume_version_id = payload.resume_version_id
    if payload.ats_score is not None:
        app.ats_score = payload.ats_score
    if payload.jd_match is not None:
        app.jd_match = payload.jd_match
    if payload.notes is not None:
        app.notes = payload.notes

    if payload.status is not None and payload.status != old_status:
        app.status = payload.status
        app.timeline.append(
            TimelineEvent(
                status=payload.status,
                note=f"Status updated to {payload.status}",
                at=datetime.now(timezone.utc),
            )
        )

    await app.save()
    return app.to_api_dict(job_title=app.role or "Job Application")


@applications_router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    user: User = Depends(get_current_user),
):
    user_id = str(user.id)
    app = await Application.get(app_id)
    if not app or (app.candidate_id != user_id and app.job_id != user_id):
        raise HTTPException(status_code=404, detail="Application not found")
    await app.delete()
    return {"message": "Application removed"}
