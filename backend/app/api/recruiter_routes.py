"""Recruiter router — job description management, applications, candidate filtering."""

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from typing import List, Optional

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.job_model import JobDescription
from app.models.application_model import Application
from app.models.analysis_model import AnalysisResult
from app.utils.logger import get_logger
from app.services.email_service import send_application_status_email
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


@recruiter_router.get("/jobs/browse")
async def browse_all_jobs(
    search: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
):
    """Return all active job listings for candidates and visitors to browse."""
    query = [JobDescription.is_active == True]
    jobs = (
        await JobDescription.find(*query)
        .sort(-JobDescription.created_at)
        .to_list()
    )

    result = []
    for j in jobs:
        # Apply client-side search filters
        if search and search.lower() not in j.title.lower() and search.lower() not in j.description.lower():
            continue
        if skill and not any(skill.lower() in s.lower() for s in j.required_skills):
            continue
        result.append({
            "id": str(j.id),
            "title": j.title,
            "description": j.description[:300] + "..." if len(j.description) > 300 else j.description,
            "required_skills": j.required_skills,
            "experience_required": j.experience_required,
            "education_required": j.education_required,
            "responsibilities": j.responsibilities,
            "created_at": j.created_at,
        })
    return result


@recruiter_router.get("/jobs/{job_id}")
async def get_job(
    job_id: str,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": str(job.id),
        "title": job.title,
        "description": job.description,
        "required_skills": job.required_skills,
        "experience_required": job.experience_required,
        "education_required": job.education_required,
        "responsibilities": job.responsibilities,
        "is_active": job.is_active,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
    }



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


@recruiter_router.post("/jobs/optimize-text")
async def optimize_job_text(
    data: dict,
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    raw_text = data.get("text", "").strip()
    if not raw_text:
        raise HTTPException(status_code=400, detail="Job description text is required")

    from langchain_groq import ChatGroq
    from langchain_core.prompts import PromptTemplate
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        return {"optimized": raw_text + "\n\nKey Qualifications:\n- Strong problem-solving abilities\n- Clear cross-team communication"}

    try:
        llm = ChatGroq(model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
        prompt = PromptTemplate.from_template(
            "You are an expert Job Description Optimization Specialist.\n"
            "Improve the following job description to make it concise, well-structured, inclusive, and ATS-friendly.\n"
            "Format clearly with Responsibilities and Qualifications sections.\n\n"
            "Original JD:\n{jd}\n\n"
            "Return only the improved job description."
        )
        chain = prompt | llm
        result = chain.invoke({"jd": raw_text[:4000]})
        return {"optimized": result.content}
    except Exception as e:
        logger.error(f"JD optimization error: {e}")
        return {"optimized": raw_text}



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

    # Fire email notification to candidate
    try:
        from app.models.user_model import User as UserModel
        candidate = await UserModel.get(application.candidate_id)
        if candidate and candidate.email:
            await send_application_status_email(
                to_email=candidate.email,
                candidate_name=candidate.name or "Candidate",
                job_title=job.title,
                new_status=new_status,
            )
    except Exception as e:
        logger.warning(f"Email notification failed (non-critical): {e}")

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


@recruiter_router.post("/jobs/{job_id}/batch-screen")
async def batch_screen_resumes(
    job_id: str,
    files: list[UploadFile] = File(...),
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    import asyncio
    from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
    from app.services.ats_service import run_ats_pipeline

    job = await JobDescription.get(job_id)
    if not job or job.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    async def screen_single_file(file: UploadFile):
        try:
            contents = await file.read()
            filename = file.filename or "resume.pdf"
            
            # Parse text
            if filename.endswith(".pdf"):
                text = extract_text_from_pdf(contents)
            elif filename.endswith(".docx"):
                text = extract_text_from_docx(contents)
            else:
                text = contents.decode("utf-8", errors="ignore")
                
            if not text.strip():
                return {"filename": filename, "error": "Could not extract text", "ats_score": 0, "eligible": False}

            # Run ATS matching asynchronously in a thread executor to not block async loop
            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(None, run_ats_pipeline, text, job.description)
            
            # Form clean name from filename (e.g. John_Doe_Resume.pdf -> John Doe)
            name_guess = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
            name_guess = " ".join([w.capitalize() for w in name_guess.split() if w.lower() not in ("resume", "cv")])
            if not name_guess.strip():
                name_guess = "Candidate"
                
            return {
                "filename": filename,
                "candidate_name": name_guess,
                "ats_score": result["ats_score"],
                "eligible": result["eligible"],
                "missing_skills": result["missing_skills"],
                "suggestions": result["suggestions"],
                "extracted_skills": result["extracted_skills"]
            }
        except Exception as e:
            return {"filename": file.filename, "error": str(e), "ats_score": 0, "eligible": False}
    tasks = [screen_single_file(f) for f in files]
    screen_results = await asyncio.gather(*tasks)
    screen_results.sort(key=lambda x: x.get("ats_score", 0), reverse=True)
    return screen_results


@recruiter_router.get("/jobs/browse")
async def browse_all_jobs(
    search: Optional[str] = Query(None),
    skill: Optional[str] = Query(None),
):
    """Return all active job listings for candidates and visitors to browse."""
    query = [JobDescription.is_active == True]
    jobs = (
        await JobDescription.find(*query)
        .sort(-JobDescription.created_at)
        .to_list()
    )

    result = []
    for j in jobs:
        # Apply client-side search filters
        if search and search.lower() not in j.title.lower() and search.lower() not in j.description.lower():
            continue
        if skill and not any(skill.lower() in s.lower() for s in j.required_skills):
            continue
        result.append({
            "id": str(j.id),
            "title": j.title,
            "description": j.description[:300] + "..." if len(j.description) > 300 else j.description,
            "required_skills": j.required_skills,
            "experience_required": j.experience_required,
            "education_required": j.education_required,
            "responsibilities": j.responsibilities,
            "created_at": j.created_at,
        })
    return result


# ── Recruiter Analytics ────────────────────────────────────────────


@recruiter_router.get("/analytics")
async def get_recruiter_analytics(
    user: User = Depends(require_roles(["recruiter", "organization_admin"])),
):
    """Return analytics data for the recruiter's jobs and applications."""
    jobs = await JobDescription.find(JobDescription.user_id == str(user.id)).to_list()
    job_ids = [str(j.id) for j in jobs]

    apps = await Application.find(Application.job_id.is_in(job_ids)).to_list() if job_ids else []

    total_jobs = len(jobs)
    total_apps = len(apps)
    scores = [a.ats_score for a in apps if a.ats_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    # Score distribution buckets
    buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for s in scores:
        if s <= 20: buckets["0-20"] += 1
        elif s <= 40: buckets["21-40"] += 1
        elif s <= 60: buckets["41-60"] += 1
        elif s <= 80: buckets["61-80"] += 1
        else: buckets["81-100"] += 1

    # Status breakdown
    status_counts: dict = {}
    for a in apps:
        status_counts[a.status] = status_counts.get(a.status, 0) + 1

    # Applications per job
    job_app_counts = []
    for j in jobs:
        count = sum(1 for a in apps if a.job_id == str(j.id))
        job_app_counts.append({"job": j.title[:30], "applications": count})
    job_app_counts.sort(key=lambda x: x["applications"], reverse=True)

    # Eligible vs not
    eligible_count = sum(1 for a in apps if a.eligible)

    return {
        "total_jobs": total_jobs,
        "total_applications": total_apps,
        "avg_ats_score": avg_score,
        "eligible_count": eligible_count,
        "ineligible_count": total_apps - eligible_count,
        "score_distribution": [{"range": k, "count": v} for k, v in buckets.items()],
        "status_breakdown": [{"status": k, "count": v} for k, v in status_counts.items()],
        "applications_per_job": job_app_counts[:10],
    }
