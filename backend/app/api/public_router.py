"""Public router — career page integration endpoints (no auth required)."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from typing import Optional

from app.models.job_model import JobDescription
from app.models.organization_model import Organization
from app.models.application_model import Application
from app.models.analysis_model import AnalysisResult
from app.models.user_model import User
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.services.ats_service import run_ats_pipeline
from app.core.roles import UserRole
from app.utils.logger import get_logger
from app.core.security import hash_password

logger = get_logger(__name__)

public_router = APIRouter(
    prefix="/public",
    tags=["Public"],
)


@public_router.get("/organizations/{org_id}/jobs")
async def list_org_jobs(org_id: str):
    org = await Organization.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    jobs = (
        await JobDescription.find(
            JobDescription.organization_id == org_id,
            JobDescription.is_active == True,
        )
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
            "created_at": j.created_at,
        }
        for j in jobs
    ]


@public_router.get("/organizations/{org_id}/jobs/{job_id}")
async def get_job_details(org_id: str, job_id: str):
    job = await JobDescription.get(job_id)
    if not job or job.organization_id != org_id or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": str(job.id),
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills,
        "experience_required": job.experience_required,
        "education_required": job.education_required,
        "responsibilities": job.responsibilities,
        "created_at": job.created_at,
    }


@public_router.post("/organizations/{org_id}/jobs/{job_id}/apply")
async def apply_to_job_public(
    org_id: str,
    job_id: str,
    file: UploadFile = File(...),
    name: str = "",
    email: str = "",
):
    org = await Organization.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    job = await JobDescription.get(job_id)
    if not job or job.organization_id != org_id or not job.is_active:
        raise HTTPException(status_code=404, detail="Job not found")

    if not name or not email:
        raise HTTPException(status_code=400, detail="Name and email are required")

    contents = await file.read()
    filename = file.filename or ""

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(contents)
    elif filename.endswith(".txt"):
        text = contents.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    existing_user = await User.find_one(User.email == email)
    if existing_user:
        candidate_id = str(existing_user.id)
    else:
        import secrets
        temp_password = secrets.token_urlsafe(12)
        candidate = User(
            name=name,
            email=email,
            password=hash_password(temp_password),
            role=UserRole.CANDIDATE,
        )
        await candidate.insert()
        candidate_id = str(candidate.id)

    result = run_ats_pipeline(text, job.description)

    analysis = AnalysisResult(
        user_id=candidate_id,
        role="candidate",
        resume_text=text,
        jd_text=job.description,
        ats_score=result["ats_score"],
        eligible=result["eligible"],
        missing_skills=result["missing_skills"],
        suggestions=result["suggestions"],
        interview_questions=result["interview_questions"],
        extracted_skills=result["extracted_skills"],
    )
    await analysis.insert()

    application = Application(
        job_id=job_id,
        candidate_id=candidate_id,
        resume_text=text,
        ats_score=result["ats_score"],
        eligible=result["eligible"],
        analysis_id=str(analysis.id),
        status="pending",
    )
    await application.insert()

    logger.info(f"Public application received for job {job.title} from {email}")
    return {
        "message": "Application submitted successfully",
        "ats_score": result["ats_score"],
        "eligible": result["eligible"],
        "missing_skills": result["missing_skills"],
    }