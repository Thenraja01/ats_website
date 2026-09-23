"""Career Intelligence router — aggregated insights from Career Vault + ATS + jobs + interviews."""

from datetime import datetime

from fastapi import APIRouter, Depends

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.career_model import CareerProfile
from app.models.resume_version_model import ResumeVersion
from app.models.analysis_model import AnalysisResult
from app.models.interview_model import InterviewSession
from app.models.application_model import Application
from app.models.notification_model import Notification

intelligence_router = APIRouter(prefix="/intelligence", tags=["Career Intelligence"])

SKILL_GROWTH_WATCHLIST = [
    "ai", "rag", "llm", "langchain", "cloud", "aws", "kubernetes", "docker",
    "system design", "generative ai", "embeddings", "vector database",
]

IN_DEMAND_SKILLS = [
    "react", "python", "typescript", "aws", "kubernetes", "rag", "llm", "docker",
    "fastapi", "postgresql", "system design", "generative ai", "terraform",
]


async def _profile(user: User) -> CareerProfile:
    p = await CareerProfile.find_one(CareerProfile.user_id == str(user.id))
    if p is None:
        p = CareerProfile(user_id=str(user.id))
        await p.insert()
    return p


@intelligence_router.get("/overview")
async def intelligence_overview(user: User = Depends(require_roles(["candidate"]))):
    profile = await _profile(user)

    skill_names = [
        s.name for s in profile.skills if s.name
    ]

    # ATS-derived strengths (from analysis history)
    analyses = (
        await AnalysisResult.find(AnalysisResult.user_id == str(user.id))
        .sort(-AnalysisResult.created_at)
        .limit(20)
        .to_list()
    )
    ats_mentions = {}
    for a in analyses:
        for skill in a.extracted_skills or []:
            key = skill.lower()
            ats_mentions[key] = ats_mentions.get(key, 0) + 1
    ats_skills = sorted(ats_mentions, key=ats_mentions.get, reverse=True)[:6]

    # Interview track record
    sessions = await InterviewSession.find(
        InterviewSession.user_id == str(user.id),
        InterviewSession.status == "completed",
    ).to_list()
    interview_scores = [s.feedback.overall for s in sessions if s.feedback]

    # Applications + matches
    apps = await Application.find(Application.candidate_id == str(user.id)).to_list()
    app_matches = [a.jd_match or a.ats_score for a in apps]
    avg_match = round(sum(app_matches) / len(app_matches)) if app_matches else 0

    # Top skills: user-listed + ATS-affirmed + JD demand
    top_skills = [s for s in skill_names[:6]]
    for s in ats_skills:
        if len(top_skills) >= 8:
            break
        pretty = s.title()
        if pretty not in top_skills and pretty.lower() not in [t.lower() for t in top_skills]:
            top_skills.append(pretty)

    growing_skills = [s for s in top_skills if s.lower() in SKILL_GROWTH_WATCHLIST][:4]
    if len(growing_skills) < 3:
        for s in IN_DEMAND_SKILLS:
            if s.title() in top_skills and len(growing_skills) < 4:
                growing_skills.append(s.title())

    potential_gaps = [s for s in IN_DEMAND_SKILLS if s.title() not in top_skills and s not in growing_skills][:5]

    avg_interview = round(sum(interview_scores) / len(interview_scores)) if interview_scores else 0

    examine_profile = profile
    readiness = _readiness(profile, analyses, avg_interview, avg_match)

    insights = _build_insights(readiness, top_skills, potential_gaps, len(sessions), len(apps))

    return {
        "topSkills": top_skills,
        "growingSkills": growing_skills,
        "potentialGaps": potential_gaps,
        "atsAffirmedSkills": [s.title() for s in ats_skills],
        "readiness": readiness,
        "stats": {
            "analysesCount": len(analyses),
            "averageAts": round(sum(a.ats_score for a in analyses) / len(analyses)) if analyses else 0,
            "applicationsCount": len(apps),
            "averageMatch": avg_match,
            "interviewsCompleted": len(sessions),
            "averageInterviewScore": avg_interview,
        },
        "insights": insights,
    }


@intelligence_router.get("/activity")
async def activity(user: User = Depends(require_roles(["candidate"]))):
    events = []

    for a in (
        await AnalysisResult.find(AnalysisResult.user_id == str(user.id)).sort(-AnalysisResult.created_at).limit(6).to_list()
    ):
        events.append({
            "type": "resume",
            "title": "Resume ATS analysis completed",
            "detail": f"Score {a.ats_score}/100",
            "at": a.created_at,
            "link": f"/ats/{a.id}",
        })

    for r in (
        await ResumeVersion.find(ResumeVersion.user_id == str(user.id)).sort(-ResumeVersion.created_at).limit(6).to_list()
    ):
        events.append({
            "type": "resume",
            "title": r.name,
            "detail": f"Version {r.version_number} · {r.template}",
            "at": r.created_at,
            "link": f"/resume-studio/{r.id}/edit",
        })

    for s in (
        await Application.find(Application.candidate_id == str(user.id)).sort(-Application.created_at).limit(6).to_list()
    ):
        events.append({
            "type": "application",
            "title": f"Application · {s.role or s.job_id}",
            "detail": f"Status: {s.status}",
            "at": s.created_at,
            "link": f"/applications/{s.id}",
        })

    for s in (
        await InterviewSession.find(InterviewSession.user_id == str(user.id)).sort(-InterviewSession.created_at).limit(6).to_list()
    ):
        events.append({
            "type": "interview",
            "title": s.title,
            "detail": "Completed" if s.status == "completed" else "In progress",
            "at": s.created_at,
            "link": f"/interview/reports/{s.id}" if s.status == "completed" else f"/interview/mock/{s.id}",
        })

    events.sort(key=lambda e: e["at"], reverse=True)
    return events[:20]


def _lensu(items, minimum):
    return len(items) >= minimum


def _readiness(profile: CareerProfile, analyses: list, avg_interview: int, avg_match: int) -> dict:
    def filled(v) -> bool:
        if isinstance(v, str):
            return bool(v.strip())
        if isinstance(v, list):
            return len(v) > 0
        return bool(v)

    personal = sum(filled(getattr(profile.personal_info, f)) for f in ["full_name", "headline", "email", "phone", "location"])
    profile_score = round(min(100, (personal / 5) * 20 + (15 if filled(profile.summary.primary) else 0)
                             + min(25, len(profile.experience) * 8) + (10 if _lensu(profile.education, 1) else 0)
                             + (10 if filled(profile.skills) else 0) + (10 if _lensu(profile.projects, 1) else 0)))

    avg_ats = round(sum(a.ats_score for a in analyses) / len(analyses)) if analyses else 0
    return {
        "profile": profile_score,
        "resume": avg_ats if analyses else 0,
        "ats": avg_ats,
        "interview": avg_interview,
        "match": avg_match or 0,
        "overall": round(
            (profile_score * 0.3 + (avg_ats if analyses else 60) * 0.3 + (avg_match or 60) * 0.2 + avg_interview * 0.2)
        ) if avg_ats or avg_match or avg_interview else profile_score,
    }


def _build_insights(readiness: dict, top_skills: list, gaps: list, interviews_done: int, applications: int) -> list:
    insights = []
    if readiness["resume"] >= 80:
        insights.append({"tone": "positive", "text": "Resume is ATS-ready. Focus shifts to interviews and applications."})
    elif readiness["resume"] < 65 and readiness["resume"] > 0:
        insights.append({"tone": "warning", "text": "Resume ATS score is below 65 — tailor it to a target JD to lift keyword match."})
    if readiness["interview"] < 70 and interviews_done > 0:
        insights.append({"tone": "warning", "text": "Interview answers are scoring below 70. Practice structuring answers with signposting."})
    if interviews_done == 0:
        insights.append({"tone": "neutral", "text": "No mock interviews yet — complete one to activate interview readiness tracking."})
    if applications == 0:
        insights.append({"tone": "neutral", "text": "You haven't logged any applications. Match a resume to a JD to start your tracker."})
    if gaps:
        gap_names = ", ".join(gaps[:3])
        insights.append({
            "tone": "info",
            "text": f"High-demand skills missing evidence: {gap_names}. Add Career Vault evidence to unlock them.",
        })
    if len(top_skills) >= 5:
        insights.append({"tone": "positive", "text": "Strong skill base detected. Career Intelligence can now power contextual interview prep."})
    return insights[:5]