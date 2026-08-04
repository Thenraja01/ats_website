"""Candidate router — resume management and application submission."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from typing import List

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.resume_model import Resume
from app.models.application_model import Application
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.core.config import settings
from app.utils.validators import sanitize_filename, validate_mime_type
from app.utils.logger import get_logger

logger = get_logger(__name__)

candidate_router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"],
)


@candidate_router.get("/dashboard")
async def candidate_dashboard(user: User = Depends(require_roles(["candidate"]))):
    return {
        "message": f"Welcome Candidate {user.name}",
    }


@candidate_router.get("/resumes")
async def list_resumes(user: User = Depends(require_roles(["candidate"]))):
    resumes = (
        await Resume.find(Resume.user_id == str(user.id))
        .sort(-Resume.created_at)
        .to_list()
    )
    return [
        {
            "id": str(r.id),
            "original_filename": r.original_filename,
            "created_at": r.created_at,
        }
        for r in resumes
    ]


@candidate_router.post("/resumes")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(require_roles(["candidate"])),
):
    contents = await file.read()
    filename = file.filename or ""

    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
        )

    filename = sanitize_filename(filename)

    allowed_mimes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if not validate_mime_type(contents, allowed_mimes):
        raise HTTPException(status_code=400, detail="Unsupported file content")

    if filename.endswith(".pdf"):
        text = extract_text_from_pdf(contents)
    elif filename.endswith(".docx"):
        text = extract_text_from_docx(contents)
    elif filename.endswith(".txt"):
        text = contents.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    resume = Resume(user_id=str(user.id), original_filename=filename, text=text)
    await resume.insert()

    return {
        "id": str(resume.id),
        "original_filename": filename,
        "message": "Resume uploaded successfully",
    }


@candidate_router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    user: User = Depends(require_roles(["candidate"])),
):
    resume = await Resume.get(resume_id)
    if not resume or resume.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Resume not found")
    await resume.delete()
    return {"message": "Resume deleted"}


@candidate_router.get("/applications")
async def list_applications(user: User = Depends(require_roles(["candidate"]))):
    apps = (
        await Application.find(Application.candidate_id == str(user.id))
        .sort(-Application.created_at)
        .to_list()
    )
    return [
        {
            "id": str(a.id),
            "job_id": a.job_id,
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "status": a.status,
            "created_at": a.created_at,
        }
        for a in apps
    ]


@candidate_router.post("/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    resume_id: str,
    user: User = Depends(require_roles(["candidate"])),
):
    from app.models.job_model import JobDescription
    from app.models.analysis_model import AnalysisResult
    from app.services.ats_service import run_ats_pipeline

    resume = await Resume.get(resume_id)
    if not resume or resume.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Resume not found")

    job = await JobDescription.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = run_ats_pipeline(resume.text, job.description)

    analysis = AnalysisResult(
        user_id=str(user.id),
        role="candidate",
        resume_text=resume.text,
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
        candidate_id=str(user.id),
        resume_text=resume.text,
        ats_score=result["ats_score"],
        eligible=result["eligible"],
        analysis_id=str(analysis.id),
        status="pending",
    )
    await application.insert()

    return {
        "id": str(application.id),
        "ats_score": result["ats_score"],
        "eligible": result["eligible"],
        "status": "pending",
    }