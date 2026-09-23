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
from app.core.config import settings
from app.utils.validators import sanitize_filename, validate_mime_type
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


@public_router.get("/tenant-info")
async def get_tenant_info(
    request: Request,
    slug: Optional[str] = None,
    domain: Optional[str] = None,
    subdomain: Optional[str] = None,
    org_id: Optional[str] = None,
):
    """Retrieve tenant branding, statistics, and landing copy dynamically."""
    # 1. Resolve identifier
    target_key = (slug or subdomain or "").strip().lower()
    
    if not target_key and domain:
        parts = domain.split(".")
        if len(parts) > 2 and parts[0] not in ["www", "api", "app", "ats", "localhost"]:
            target_key = parts[0].lower()

    if not target_key:
        host = request.headers.get("host", "").split(":")[0].lower()
        parts = host.split(".")
        if len(parts) > 2 and parts[0] not in ["www", "api", "app", "ats", "localhost"]:
            target_key = parts[0].lower()

    # Default tenant presets
    PRESETS = {
        "jeeva": {
            "name": "Jeeva Technologies",
            "tagline": "Next-Gen AI Talent Cloud & Autonomous Hiring",
            "headline": "Empower your career journey at Jeeva",
            "subheading": "Access the AI-powered recruitment engine with real-time skill matching and instant application tracking.",
            "badge": "Jeeva Enterprise Workspace",
            "stats": {
                "match_rate": "99.4%",
                "candidates_placed": "12,800+",
                "hiring_speed": "4.2x Faster",
                "active_jobs": "84 Openings",
            },
            "testimonial": {
                "quote": "HireMind's intelligent screening engine reduced our candidate qualification time from days to seconds.",
                "author": "Jeeva Talent Acquisition Lead",
                "role": "Head of Engineering Hiring",
            },
            "accent_color": "#4F8CFF",
        },
        "nexus": {
            "name": "Nexus AI Systems",
            "tagline": "Autonomous Workforce & Intelligence Architecture",
            "headline": "Join the Next Era of Innovation at Nexus",
            "subheading": "Streamlined recruitment platform powered by deep semantic skill extraction and predictive ATS scoring.",
            "badge": "Nexus AI Cloud",
            "stats": {
                "match_rate": "98.9%",
                "candidates_placed": "24,500+",
                "hiring_speed": "3.8x Faster",
                "active_jobs": "120+ Openings",
            },
            "testimonial": {
                "quote": "The match precision and candidate insights have completely supercharged our hiring pipeline.",
                "author": "Nexus People Operations",
                "role": "VP of Human Resources",
            },
            "accent_color": "#8B5CF6",
        },
        "apex": {
            "name": "Apex Global Systems",
            "tagline": "Enterprise Cloud & AI Solutions Ecosystem",
            "headline": "Accelerate your impact with Apex Systems",
            "subheading": "Connect directly with top enterprise opportunities matched precisely to your technical profile.",
            "badge": "Apex Global Careers",
            "stats": {
                "match_rate": "99.1%",
                "candidates_placed": "18,900+",
                "hiring_speed": "5x Faster",
                "active_jobs": "95 Openings",
            },
            "testimonial": {
                "quote": "Our engineering managers love the transparent skill gap breakdowns and fast candidate filtering.",
                "author": "Apex Hiring Team",
                "role": "Lead Technical Recruiter",
            },
            "accent_color": "#06B6D4",
        },
    }

    # Check DB Organization if org_id or match
    db_org = None
    if org_id:
        db_org = await Organization.get(org_id)
    elif target_key:
        db_org = await Organization.find_one({"name": {"$regex": f"^{target_key}", "$options": "i"}})

    if db_org:
        org_name = db_org.name
        preset = PRESETS.get(target_key, {})
        return {
            "id": str(db_org.id),
            "slug": target_key or str(db_org.id),
            "name": org_name,
            "tagline": preset.get("tagline", db_org.description or "Intelligent Applicant Tracking & Talent Acquisition"),
            "headline": preset.get("headline", f"Welcome to {org_name} Talent Portal"),
            "subheading": preset.get("subheading", f"Sign in to access your {org_name} talent ecosystem and track your hiring pipeline in real-time."),
            "badge": preset.get("badge", f"{org_name} Workspace"),
            "website": db_org.website or "",
            "stats": preset.get("stats", {
                "match_rate": "99.2%",
                "candidates_placed": "10,000+",
                "hiring_speed": "3.5x Faster",
                "active_jobs": "50+ Openings",
            }),
            "testimonial": preset.get("testimonial", {
                "quote": "HireMind ATS delivers unmatched candidate matching accuracy and transparent scoring.",
                "author": "Talent Partner",
                "role": f"{org_name} Recruitment",
            }),
            "accent_color": preset.get("accent_color", "#4F8CFF"),
            "features": [
                "Semantic Resume Analysis & Parsing",
                "Real-Time Match Score Calculation",
                "Automated Skill Gap & Interview Insights",
                "Role-Based Candidate & Recruiter Portals",
            ],
            "is_custom_tenant": True,
        }

    # Match predefined presets
    if target_key in PRESETS:
        preset = PRESETS[target_key]
        return {
            "id": target_key,
            "slug": target_key,
            "name": preset["name"],
            "tagline": preset["tagline"],
            "headline": preset["headline"],
            "subheading": preset["subheading"],
            "badge": preset["badge"],
            "stats": preset["stats"],
            "testimonial": preset["testimonial"],
            "accent_color": preset["accent_color"],
            "features": [
                "Semantic Resume Analysis & Parsing",
                "Real-Time Match Score Calculation",
                "Automated Skill Gap & Interview Insights",
                "Role-Based Candidate & Recruiter Portals",
            ],
            "is_custom_tenant": True,
        }

    # Fallback to HireMind Default Platform Branding
    return {
        "id": "hiremind",
        "slug": "hiremind",
        "name": "HireMind AI",
        "tagline": "AI-Powered Applicant Tracking System & Resume Intelligence",
        "headline": "Elevate your hiring pipeline with AI precision",
        "subheading": "Evaluate resumes, bridge skill gaps, and match with top industry roles in seconds with next-gen LLM analysis.",
        "badge": "Enterprise ATS Suite",
        "stats": {
            "match_rate": "99.4%",
            "candidates_placed": "25,000+",
            "hiring_speed": "4x Faster",
            "active_jobs": "500+ Openings",
        },
        "testimonial": {
            "quote": "HireMind transformed our technical recruitment workflow, cutting time-to-hire by over 60%.",
            "author": "Sarah Jenkins",
            "role": "VP of Talent Acquisition",
        },
        "accent_color": "#4F8CFF",
        "features": [
            "LLM-Powered Multi-Factor Resume Scoring",
            "Context-Aware JD & Skill Gap Extraction",
            "Instant Automated Interview Question Generator",
            "Candidate & Recruiter Real-Time Portals",
        ],
        "is_custom_tenant": False,
    }