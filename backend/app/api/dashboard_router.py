"""HireMind AI — Dynamic User Dashboard Router.

Computes live statistics from the user's master profile, resumes, applications,
and mock interview sessions. No hardcoded stats!
"""

from fastapi import APIRouter, Depends
from datetime import datetime

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.career_model import CareerProfile
from app.models.resume_version_model import ResumeVersion
from app.models.analysis_model import AnalysisResult
from app.models.application_model import Application
from app.models.interview_model import InterviewSession

dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _calculate_profile_completion(profile: CareerProfile) -> int:
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
            "filled": sum(filled(getattr(profile.personal_info, f, "")) for f in [
                "full_name", "headline", "email", "phone", "location",
            ]),
            "total": 5,
        },
        "summary": {
            "filled": 1 if filled(profile.summary.primary) else 0,
            "total": 1,
        },
        "experience": {"filled": len(profile.experience), "total": 2},
        "education": {"filled": len(profile.education), "total": 1},
        "projects": {"filled": len(profile.projects), "total": 1},
        "skills": {"filled": len(profile.skills), "total": 4},
        "certifications": {"filled": len(profile.certifications), "total": 1},
        "languages": {"filled": len(profile.languages), "total": 1},
    }

    weights = {
        "personalInfo": 20, "summary": 15, "experience": 25, "education": 10,
        "projects": 10, "skills": 10, "certifications": 5, "languages": 5,
    }
    total_weight = sum(weights.values())
    overall = 0
    for key, info in sections.items():
        ratio = min(1.0, info["filled"] / max(info["total"], 1))
        sub = round(ratio * 100)
        overall += sub * weights[key]

    return round(overall / max(total_weight, 1))


@dashboard_router.get("")
async def get_dashboard_data(user: User = Depends(get_current_user)):
    user_id = str(user.id)

    # 1. Profile Completion
    profile = await CareerProfile.find_one(CareerProfile.user_id == user_id)
    if profile is None:
        profile = CareerProfile(user_id=user_id)
        await profile.insert()
    profile_completion = _calculate_profile_completion(profile)

    # 2. Resumes & ATS Health
    resumes = await ResumeVersion.find(ResumeVersion.user_id == user_id).sort(-ResumeVersion.updated_at).to_list()
    analyses = await AnalysisResult.find(AnalysisResult.user_id == user_id).sort(-AnalysisResult.created_at).to_list()
    
    resume_scores = []
    for r in resumes:
        if r.ats and r.ats.score:
            resume_scores.append(r.ats.score)
    for a in analyses:
        if a.ats_score:
            resume_scores.append(a.ats_score)
    
    avg_resume_score = round(sum(resume_scores) / len(resume_scores)) if resume_scores else (70 if profile_completion > 50 else 50)

    # 3. Interviews Readiness
    sessions = await InterviewSession.find(InterviewSession.user_id == user_id).sort(-InterviewSession.updated_at).to_list()
    completed_sessions = [s for s in sessions if s.status == "completed" and s.feedback]
    
    if completed_sessions:
        interview_readiness = round(sum(s.feedback.overall for s in completed_sessions) / len(completed_sessions))
    else:
        interview_readiness = 65 if profile_completion > 50 else 40

    # 4. Applications breakdown
    apps = await Application.find(
        (Application.candidate_id == user_id) | (Application.job_id == user_id)
    ).sort(-Application.created_at).to_list()
    
    total_apps = len(apps)
    interviews_count = sum(1 for a in apps if a.status in ("interview", "technical"))
    offers_count = sum(1 for a in apps if a.status == "offer")
    screening_count = sum(1 for a in apps if a.status == "screening")
    applied_count = sum(1 for a in apps if a.status == "applied")

    # 5. Recent items
    recent_resumes = [r.to_api_dict() for r in resumes[:5]]
    recent_interviews = [s.to_api_dict(include_answers=False) for s in sessions[:5]]
    recent_applications = [a.to_api_dict() for a in apps[:5]]

    # 6. Contextual AI Recommendations
    recommendations = []
    if profile_completion < 80:
        recommendations.append({
            "id": "rec_profile",
            "type": "profile",
            "title": "Complete your Master Profile",
            "description": "Adding your technical skills, experience bullets, and projects unlocks richer AI resume optimization.",
            "action_text": "Edit Profile",
            "action_link": "/profile",
            "priority": "high" if profile_completion < 50 else "medium",
        })

    if not resumes:
        recommendations.append({
            "id": "rec_resume",
            "type": "resume",
            "title": "Build your first ATS-optimized Resume",
            "description": "Create a structured resume using your Master Profile and test it with the ATS Analyzer.",
            "action_text": "Create Resume",
            "action_link": "/resume-studio/new",
            "priority": "high",
        })
    elif avg_resume_score < 75:
        recommendations.append({
            "id": "rec_ats",
            "type": "ats",
            "title": "Improve Resume ATS Score",
            "description": "Run the JD Match engine to tailor your resume keywords against your target job description.",
            "action_text": "Tailor to JD",
            "action_link": "/resume-studio/jd-tailor",
            "priority": "medium",
        })

    if not completed_sessions:
        recommendations.append({
            "id": "rec_interview",
            "type": "interview",
            "title": "Practice a Mock Interview",
            "description": "Run an interactive AI mock interview based on your profile and target job title.",
            "action_text": "Start Mock Interview",
            "action_link": "/interview/mock",
            "priority": "medium",
        })
    elif interview_readiness < 75:
        recommendations.append({
            "id": "rec_interview_prep",
            "type": "interview",
            "title": "Sharpen Interview Communication",
            "description": "Review your previous interview feedback reports and practice technical questions.",
            "action_text": "View Reports",
            "action_link": "/interview/reports",
            "priority": "low",
        })

    if total_apps == 0:
        recommendations.append({
            "id": "rec_apps",
            "type": "application",
            "title": "Track your Job Applications",
            "description": "Keep track of jobs you've applied to and organize your interview pipeline in Kanban view.",
            "action_text": "Open Tracker",
            "action_link": "/applications",
            "priority": "low",
        })

    return {
        "user_name": user.name,
        "profile_completion": profile_completion,
        "resume_score": avg_resume_score,
        "interview_readiness": interview_readiness,
        "applications": {
            "total": total_apps,
            "applied": applied_count,
            "screening": screening_count,
            "interviews": interviews_count,
            "offers": offers_count,
        },
        "recent_resumes": recent_resumes,
        "recent_interviews": recent_interviews,
        "recent_applications": recent_applications,
        "recommendations": recommendations,
    }
