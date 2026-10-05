"""Job Description, Matching, and AI Cover Letter Router.

Spec: HireMind AI — one user type (USER).
Analyzes JDs, compares with user resumes and master career profile, calculates ATS & skill match,
and provides truthful gap analysis and AI-powered cover letter generation.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from typing import Optional, List

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.career_model import CareerProfile, to_camel
from app.models.resume_version_model import ResumeVersion, render_resume_to_text
from app.services.job_insights_service import analyze_jd
from app.services.match_service import match_resume_jd
from app.services.ats_service import get_llm
from app.core.config import settings

jd_router = APIRouter(prefix="/jd", tags=["Job Description Matching"])


class JDAnalyzeRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")
    jd_text: str
    job_title: Optional[str] = None


class JDMatchRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")
    jd_text: str
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None


class CoverLetterRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")
    job_title: str = "the role"
    job_description: str = ""
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None


@jd_router.post("/analyze")
async def analyze_job_description(
    payload: JDAnalyzeRequest,
    user: User = Depends(get_current_user),
):
    if not payload.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text is required")
    return analyze_jd(payload.jd_text)


@jd_router.post("/match")
async def match_resume_with_jd(
    payload: JDMatchRequest,
    user: User = Depends(get_current_user),
):
    jd_text = payload.jd_text.strip()
    if not jd_text:
        raise HTTPException(status_code=400, detail="Job description is required")

    resume_text = payload.resume_text or ""
    if payload.resume_id:
        resume = await ResumeVersion.get(payload.resume_id)
        if resume and resume.user_id == str(user.id):
            resume_text = render_resume_to_text(resume)
        else:
            raise HTTPException(status_code=404, detail="Resume not found")

    if not resume_text.strip():
        profile = await CareerProfile.find_one(CareerProfile.user_id == str(user.id))
        if profile:
            parts = [profile.personal_info.full_name, profile.personal_info.headline, profile.summary.primary]
            for exp in profile.experience:
                parts.extend([exp.company, exp.job_title, exp.description, *exp.responsibilities])
            for proj in profile.projects:
                parts.extend([proj.name, proj.technologies, proj.description])
            for s in profile.skills:
                parts.append(s.name if isinstance(s.name, str) else "")
            resume_text = " ".join(str(p) for p in parts if p)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="No resume or profile content available to match")

    insights = analyze_jd(jd_text)
    match_result = match_resume_jd(
        resume_text,
        jd_text,
        insights.get("requiredSkills", []),
        insights.get("preferredSkills", []),
    )

    return {
        "jdInsights": insights,
        "match": match_result,
        "resumeId": payload.resume_id,
    }


@jd_router.post("/cover-letter")
async def generate_cover_letter(
    payload: CoverLetterRequest,
    user: User = Depends(get_current_user),
):
    """Generate a tailored, high-impact cover letter using AI based on user resume and target JD."""
    candidate_name = user.name or "Candidate"
    job_title = payload.job_title or "Target Role"
    jd = payload.job_description or ""

    resume_text = payload.resume_text or ""
    if payload.resume_id:
        resume = await ResumeVersion.get(payload.resume_id)
        if resume and resume.user_id == str(user.id):
            resume_text = render_resume_to_text(resume)

    if not resume_text:
        profile = await CareerProfile.find_one(CareerProfile.user_id == str(user.id))
        if profile:
            parts = [profile.personal_info.full_name, profile.personal_info.headline, profile.summary.primary]
            for exp in profile.experience:
                parts.extend([f"{exp.job_title} at {exp.company}", exp.description, *exp.responsibilities])
            for proj in profile.projects:
                parts.extend([proj.name, proj.technologies, proj.description])
            for s in profile.skills:
                parts.append(s.name if isinstance(s.name, str) else "")
            resume_text = " \n".join(str(p) for p in parts if p)

    if settings.GROQ_API_KEY:
        try:
            from langchain_core.prompts import PromptTemplate
            llm = get_llm()
            prompt = PromptTemplate.from_template(
                "You are an expert executive career advisor and professional writer for HireMind AI.\n"
                "Write a compelling, professional, personalized cover letter tailored specifically to the target role.\n\n"
                "Candidate Name: {name}\n"
                "Target Role / Title: {job_title}\n"
                "Job Description Context:\n{jd}\n\n"
                "Candidate Background & Resume Data:\n{resume}\n\n"
                "Guidelines:\n"
                "- Open with a confident, tailored hook highlighting alignment with the role.\n"
                "- In body paragraphs, connect candidate's real accomplishments directly to the key requirements of the JD.\n"
                "- Emphasize measurable impact, technical strength, and cultural fit.\n"
                "- Close with a proactive call to action.\n"
                "- Do NOT make up false companies or degrees not present in the background.\n"
                "- Return ONLY the final cover letter text.\n"
            )
            chain = prompt | llm
            res = chain.invoke({
                "name": candidate_name,
                "job_title": job_title,
                "jd": jd[:3000],
                "resume": (resume_text or "Software & Technical Professional")[:4000],
            })
            letter = res.content.strip()
            return {"cover_letter": letter, "model": "llama-3.3-70b-versatile"}
        except Exception as e:
            pass

    # Heuristic template fallback
    letter = (
        f"Dear Hiring Manager,\n\n"
        f"I am writing to express my strong enthusiasm for the {job_title} position. "
        f"With my technical background and demonstrated track record in software engineering and problem-solving, "
        f"I am eager to contribute immediately to your team's upcoming initiatives.\n\n"
        f"Throughout my career, I have focused on designing resilient systems, collaborating cross-functionally, "
        f"and turning complex business requirements into high-performing software solutions. "
        f"The opportunity outlined in your job description aligns closely with my core strengths and passion for building scalable impact.\n\n"
        f"Thank you for your time and consideration. I welcome the opportunity to discuss how my qualifications align with your goals.\n\n"
        f"Sincerely,\n"
        f"{candidate_name}"
    )
    return {"cover_letter": letter, "model": "template-fallback"}
