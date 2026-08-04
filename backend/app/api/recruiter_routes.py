"""Recruiter router — job description management, applications, candidate filtering."""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.job_model import JobDescription
from app.models.application_model import Application
from app.models.analysis_model import AnalysisResult
from app.utils.logger import get_logger
from datetime import datetime, timezone
import json

logger = get_logger(__name__)

recruiter_router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"],
)


@recruiter_router.get("/dashboard")
async def recruiter_dashboard(user: User = Depends(require_roles(["recruiter"]))):
    return {
        "message": f"Welcome Recruiter {user.name}",
    }


# ── Job Description CRUD ──────────────────────────────


@recruiter_router.get("/jobs")
async def list_jobs(
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    jobs = (
        await JobDescription.find(JobDescription.user_id == str(user.id))
        .sort(-JobDescription.created_at)
        .to_list()
    )
    return [
        {
            "id": str(j.id),
            "title": j.title,
            "description": j.description,
            "required_skills": j.required_skills,
            "experience_required": j.experience_required,
            "education_required": j.education_required,
            "responsibilities": j.responsibilities,
            "is_active": j.is_active,
            "created_at": j.created_at,
            "updated_at": j.updated_at,
        }
        for j in jobs
    ]


@recruiter_router.post("/jobs")
async def create_job(
    data: dict,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = JobDescription(
        user_id=str(user.id),
        title=data.get("title", ""),
        description=data.get("description", ""),
        required_skills=data.get("required_skills", []),
        experience_required=data.get("experience_required"),
        education_required=data.get("education_required"),
        responsibilities=data.get("responsibilities", []),
    )
    await job.insert()
    return {
        "id": str(job.id),
        "title": job.title,
        "message": "Job description created",
    }


@recruiter_router.put("/jobs/{job_id}")
async def update_job(
    job_id: str,
    data: dict,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    for field in ["title", "description", "required_skills", "experience_required",
                  "education_required", "responsibilities", "is_active"]:
        if field in data:
            setattr(job, field, data[field])

    job.updated_at = datetime.now(timezone.utc)
    await job.save()
    return {"message": "Job updated", "id": job_id}


@recruiter_router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: str,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    await job.delete()
    return {"message": "Job deleted"}


@recruiter_router.post("/jobs/{job_id}/optimize")
async def optimize_job(
    job_id: str,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    from langchain_groq import ChatGroq
    from langchain_core.prompts import PromptTemplate
    from app.core.config import settings

    llm = ChatGroq(model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
    prompt = PromptTemplate.from_template(
        "You are an expert Job Description Optimization Specialist.\n"
        "Improve the following job description to make it more inclusive, clear, and ATS-friendly.\n"
        "Suggest better formatting, keywords, and structure.\n\n"
        "Original JD:\n{jd}\n\n"
        "Return the optimized job description with a list of suggested keywords to add."
    )
    chain = prompt | llm
    result = chain.invoke({"jd": job.description})
    return {"optimized": result.content}


# ── Applications ─────────────────────────────────────


@recruiter_router.get("/jobs/{job_id}/applications")
async def get_job_applications(
    job_id: str,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    apps = (
        await Application.find(Application.job_id == job_id)
        .sort(-Application.created_at)
        .to_list()
    )

    result = []
    for a in apps:
        from app.models.user_model import User as UserModel
        candidate = await UserModel.get(a.candidate_id)
        result.append({
            "id": str(a.id),
            "candidate_id": a.candidate_id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "status": a.status,
            "analysis_id": a.analysis_id,
            "created_at": a.created_at,
        })
    return result


@recruiter_router.get("/applications")
async def get_all_applications(
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    jobs = await JobDescription.find(JobDescription.user_id == str(user.id)).to_list()
    job_ids = [str(j.id) for j in jobs]
    apps = (
        await Application.find(Application.job_id.is_in(job_ids))
        .sort(-Application.created_at)
        .to_list()
    )

    result = []
    for a in apps:
        from app.models.user_model import User as UserModel
        candidate = await UserModel.get(a.candidate_id)
        job = await JobDescription.get(a.job_id)
        result.append({
            "id": str(a.id),
            "job_id": a.job_id,
            "job_title": job.title if job else "Unknown",
            "candidate_id": a.candidate_id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "status": a.status,
            "analysis_id": a.analysis_id,
            "created_at": a.created_at,
        })
    return result


@recruiter_router.put("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    data: dict,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    application = await Application.get(app_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Verify the application belongs to a job owned by the current user
    job = await JobDescription.get(application.job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    new_status = data.get("status")
    if new_status not in ["pending", "shortlisted", "rejected", "hired"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    application.status = new_status
    await application.save()
    return {"message": f"Application status updated to {new_status}"}


@recruiter_router.get("/candidates/filter")
async def filter_candidates(
    min_score: Optional[int] = Query(None),
    skills: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    eligible: Optional[bool] = Query(None),
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    jobs = await JobDescription.find(JobDescription.user_id == str(user.id)).to_list()
    job_ids = [str(j.id) for j in jobs]

    filters = [Application.job_id.is_in(job_ids)]
    if min_score:
        filters.append(Application.ats_score >= min_score)
    if status:
        filters.append(Application.status == status)
    if eligible is not None:
        filters.append(Application.eligible == eligible)

    apps = (
        await Application.find(*filters)
        .sort(-Application.ats_score)
        .to_list()
    )

    result = []
    for a in apps:
        from app.models.user_model import User as UserModel
        candidate = await UserModel.get(a.candidate_id)
        job = await JobDescription.get(a.job_id)
        result.append({
            "id": str(a.id),
            "job_id": a.job_id,
            "job_title": job.title if job else "Unknown",
            "candidate_id": a.candidate_id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "status": a.status,
            "created_at": a.created_at,
        })

    result.sort(key=lambda x: x["ats_score"], reverse=True)
    return result


@recruiter_router.get("/jobs/{job_id}/rankings")
async def get_candidate_rankings(
    job_id: str,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    apps = (
        await Application.find(Application.job_id == job_id)
        .sort(-Application.ats_score)
        .to_list()
    )

    result = []
    for a in apps:
        from app.models.user_model import User as UserModel
        candidate = await UserModel.get(a.candidate_id)
        result.append({
            "rank": len(result) + 1,
            "id": str(a.id),
            "candidate_id": a.candidate_id,
            "candidate_name": candidate.name if candidate else "Unknown",
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "status": a.status,
            "analysis_id": a.analysis_id,
        })
    return result