"""Candidate router — resume management and application submission."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from typing import List
from pydantic import BaseModel

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.resume_model import Resume
from app.models.application_model import Application, TimelineEvent
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
            "text": r.text,
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
    from app.models.job_model import JobDescription
    
    apps = (
        await Application.find(Application.candidate_id == str(user.id))
        .sort(-Application.created_at)
        .to_list()
    )
    
    result = []
    for a in apps:
        job = await JobDescription.get(a.job_id)
        result.append(a.to_api_dict(job.title if job else "General Application"))
    return result


@candidate_router.get("/applications/{app_id}")
async def get_application(app_id: str, user: User = Depends(require_roles(["candidate"]))):
    from app.models.job_model import JobDescription

    app = await Application.get(app_id)
    if not app or app.candidate_id != str(user.id):
        raise HTTPException(status_code=404, detail="Application not found")
    job = await JobDescription.get(app.job_id)
    return app.to_api_dict(job.title if job else "General Application")


class StatusUpdate(BaseModel):
    status: str
    note: str = ""


@candidate_router.patch("/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    payload: StatusUpdate,
    user: User = Depends(require_roles(["candidate"])),
):
    from app.models.application_model import APPLICATION_STATUSES

    app = await Application.get(app_id)
    if not app or app.candidate_id != str(user.id):
        raise HTTPException(status_code=404, detail="Application not found")
    if payload.status not in APPLICATION_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Use one of: {', '.join(APPLICATION_STATUSES)}")

    app.status = payload.status
    app.timeline = [*app.timeline, TimelineEvent(status=payload.status, note=payload.note)]
    await app.save()
    return app.to_api_dict()


@candidate_router.post("/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    resume_id: str = "",
    resume_version_id: str = "",
    user: User = Depends(require_roles(["candidate"])),
):
    from app.models.job_model import JobDescription
    from app.models.analysis_model import AnalysisResult
    from app.models.application_model import TimelineEvent
    from app.models.resume_version_model import ResumeVersion, render_resume_to_text
    from app.models.notification_model import Notification
    from app.services.ats_service import run_ats_pipeline
    from app.services.match_service import match_resume_jd

    resume_text = ""
    source_label = "Manual application"
    if resume_version_id:
        version = await ResumeVersion.get(resume_version_id)
        if not version or version.user_id != str(user.id):
            raise HTTPException(status_code=404, detail="Resume version not found")
        resume_text = render_resume_to_text(version)
        source_label = version.name
    elif resume_id:
        resume = await Resume.get(resume_id)
        if not resume or resume.user_id != str(user.id):
            raise HTTPException(status_code=404, detail="Resume not found")
        resume_text = resume.text
        source_label = resume.original_filename

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="A resume with content is required to apply")

    job = await JobDescription.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = run_ats_pipeline(resume_text, job.description)
    from app.services.job_insights_service import analyze_jd
    insights = analyze_jd(job.description)
    match = match_resume_jd(resume_text, job.description, insights["requiredSkills"], insights["preferredSkills"])

    analysis = AnalysisResult(
        user_id=str(user.id),
        role="candidate",
        resume_text=resume_text,
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
        resume_text=resume_text,
        ats_score=result["ats_score"],
        eligible=result["eligible"],
        analysis_id=str(analysis.id),
        resume_version_id=resume_version_id or None,
        jd_match=match["overall"],
        role=job.title,
        status="applied",
        timeline=[TimelineEvent(status="applied", note=f"Applied with {source_label}")],
    )
    await application.insert()

    await Notification(
        user_id=str(user.id),
        type="application",
        title="Application submitted",
        message=f"Applied to {job.title} with {source_label}. Match: {match['overall']}%.",
        link=f"/applications/{application.id}",
    ).insert()

    return {
        "id": str(application.id),
        "ats_score": result["ats_score"],
        "eligible": result["eligible"],
        "jd_match": match["overall"],
        "analysis_id": str(analysis.id),
        "status": "applied",
    }


@candidate_router.post("/cover-letter")
async def generate_cover_letter(
    data: dict,
    user: User = Depends(require_roles(["candidate"])),
):
    resume_text = data.get("resume_text", "").strip()
    jd_text = data.get("job_description", "").strip()
    job_title = data.get("job_title", "Position").strip()
    
    if not resume_text or not jd_text:
        raise HTTPException(status_code=400, detail="Resume text and job description are required")

    from langchain_groq import ChatGroq
    from langchain_core.prompts import PromptTemplate
    from app.core.config import settings

    if not settings.GROQ_API_KEY:
        fallback_letter = (
            f"Dear Hiring Team,\n\n"
            f"I am writing to express my strong interest in the {job_title} position. "
            f"Based on my professional background and skills, I am confident that I can make a significant contribution to your team.\n\n"
            f"Key strengths that I bring to this role include:\n"
            f"- Dedicated professional experience\n"
            f"- Strong technical and collaborative skills\n"
            f"- Eagerness to learn and drive impact\n\n"
            f"Thank you for your time and consideration. I look forward to discussing how my qualifications align with your needs.\n\n"
            f"Sincerely,\n{user.name}"
        )
        return {"cover_letter": fallback_letter}

    try:
        llm = ChatGroq(model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)
        prompt = PromptTemplate.from_template(
            "You are an expert Career Coach and Professional Resume Writer.\n"
            "Write a highly tailored, compelling, and professional cover letter for a candidate applying for the job of '{job_title}'.\n\n"
            "Candidate Name: {candidate_name}\n\n"
            "Candidate Resume Details:\n{resume}\n\n"
            "Job Description:\n{jd}\n\n"
            "Requirements:\n"
            "- Maintain a highly professional, encouraging, and confident tone.\n"
            "- Directly reference matching skills and experience from the resume details that align with the job description.\n"
            "- Keep it concise (under 400 words) and formatted with proper line breaks.\n"
            "- Return only the final cover letter text. Do not include any chat conversational intro/outro or markdown wrapper codeblocks."
        )
        chain = prompt | llm
        result = chain.invoke({
            "job_title": job_title,
            "candidate_name": user.name,
            "resume": resume_text[:3000],
            "jd": jd_text[:3000]
        })
        return {"cover_letter": result.content.strip()}
    except Exception as e:
        logger.error(f"Cover letter generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")