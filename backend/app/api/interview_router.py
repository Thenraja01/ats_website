"""Interview router — question bank, project preparation, and mock interview sessions.

Spec: HireMind AI — one user type (USER).
"""

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.career_model import to_camel
from app.models.interview_model import (
    InterviewQuestion,
    InterviewSession,
    QuestionRef,
    SessionFeedback,
    SavedQuestion,
)
from app.services.interview_service import (
    CATEGORIES,
    DIFFICULTIES,
    QUESTION_BANK,
    build_session_from_bank,
    compute_answer_feedback,
    generate_project_questions,
)

interview_router = APIRouter(prefix="/interview", tags=["Interview"])


async def ensure_seeded():
    """Insert the curated bank into Mongo once so questions can be saved/customized."""
    if await InterviewQuestion.find_one({"user_id": None}):
        return
    docs = [
        InterviewQuestion(
            user_id=None,
            category=q["category"],
            difficulty=q["difficulty"],
            question=q["question"],
            ideal_answer=q["ideal_answer"],
            keywords=q["keywords"],
            tags=[],
        )
        for q in QUESTION_BANK
    ]
    if docs:
        await InterviewQuestion.insert_many(docs)


async def _saved_ids_for(user_id: str) -> set[str]:
    rows = await SavedQuestion.find(SavedQuestion.user_id == str(user_id)).to_list()
    return {str(r.question_id) for r in rows}


@interview_router.get("/meta")
async def metadata():
    return {"categories": CATEGORIES, "difficulties": DIFFICULTIES}


@interview_router.get("/questions")
async def list_questions(
    category: str = Query("All"),
    difficulty: str = Query("All"),
    saved_only: bool = Query(False),
    search: str = Query(""),
    limit: int = Query(100),
    offset: int = Query(0),
    user: User = Depends(get_current_user),
):
    await ensure_seeded()
    saved_ids = await _saved_ids_for(str(user.id))

    query: dict = {"user_id": None}
    if category != "All":
        query["category"] = category
    if difficulty != "All":
        query["difficulty"] = difficulty
    if search:
        query["question"] = {"$regex": search, "$options": "i"}

    system_docs = await InterviewQuestion.find(query).sort("category").skip(offset).limit(limit).to_list()
    user_docs = await InterviewQuestion.find(InterviewQuestion.user_id == str(user.id)).to_list()

    result = []
    for doc in system_docs:
        payload = doc.to_api_dict()
        payload["saved"] = str(doc.id) in saved_ids
        result.append(payload)
    for doc in user_docs:
        payload = doc.to_api_dict()
        payload["saved"] = True
        result.append(payload)

    if saved_only:
        result = [r for r in result if r["saved"]]

    return result


@interview_router.post("/questions")
async def create_question(
    payload: dict,
    user: User = Depends(get_current_user),
):
    question = payload.get("question", "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    doc = InterviewQuestion(
        user_id=str(user.id),
        category=payload.get("category", "Technical"),
        difficulty=payload.get("difficulty", "Intermediate"),
        question=question,
        ideal_answer=payload.get("ideal_answer", ""),
        keywords=payload.get("keywords", []),
        tags=payload.get("tags", []),
        is_custom=True,
        saved=True,
    )
    await doc.insert()
    return doc.to_api_dict()


@interview_router.put("/questions/{question_id}/save")
async def toggle_save_question(
    question_id: str,
    payload: dict,
    user: User = Depends(get_current_user),
):
    doc = await InterviewQuestion.get(question_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Question not found")
    want_saved = bool(payload.get("saved", True))

    if doc.is_custom and doc.user_id == str(user.id):
        if not want_saved:
            await doc.delete()
            return {"message": "Question removed", "saved": False}
        return doc.to_api_dict()

    if doc.user_id is not None and doc.user_id != str(user.id):
        raise HTTPException(status_code=403, detail="Cannot modify this question")

    if want_saved:
        existing = await SavedQuestion.find_one(
            SavedQuestion.user_id == str(user.id),
            SavedQuestion.question_id == question_id,
        )
        if not existing:
            await SavedQuestion(user_id=str(user.id), question_id=question_id).insert()
    else:
        await SavedQuestion.find_one(
            SavedQuestion.user_id == str(user.id),
            SavedQuestion.question_id == question_id,
        ).delete()

    return {"message": "Saved" if want_saved else "Unsaved", "saved": want_saved}


@interview_router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    user: User = Depends(get_current_user),
):
    doc = await InterviewQuestion.get(question_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Question not found")
    if not doc.is_custom or doc.user_id != str(user.id):
        raise HTTPException(status_code=403, detail="System questions cannot be deleted")
    await doc.delete()
    return {"message": "Question deleted"}


@interview_router.post("/project-questions")
async def project_questions(payload: dict, user: User = Depends(get_current_user)):
    project = payload.get("project", {})
    if not project.get("name"):
        raise HTTPException(status_code=400, detail="A project with a name is required")
    return {"questions": generate_project_questions(project)}


@interview_router.post("/sessions")
async def start_session(payload: dict, user: User = Depends(get_current_user)):
    await ensure_seeded()
    session_type = payload.get("session_type", "mock")
    title = payload.get("title", "Mock Interview")
    count = int(payload.get("count", 10))
    category = payload.get("category", "All")
    difficulty = payload.get("difficulty", "All")
    question_ids = payload.get("question_ids", [])

    if question_ids:
        docs = []
        for qid in question_ids:
            doc = await InterviewQuestion.get(qid)
            if doc:
                docs.append(doc)
    else:
        query: dict = {"user_id": None}
        if category != "All":
            query["category"] = category
        if difficulty != "All":
            query["difficulty"] = difficulty
        docs = await InterviewQuestion.find(query).to_list(count or 10)

    if not docs:
        raise HTTPException(status_code=400, detail="No questions available for the chosen criteria")

    questions = [QuestionRef.model_validate(x) for x in build_session_from_bank(docs, count=count or 10)]

    session = InterviewSession(
        user_id=str(user.id),
        title=title,
        session_type=session_type,
        job_title=payload.get("job_title", ""),
        resume_version_id=payload.get("resume_version_id"),
        status="in_progress",
        current_index=0,
        questions=questions,
    )
    await session.insert()
    return session.to_api_dict()


@interview_router.get("/sessions")
async def list_sessions(user: User = Depends(get_current_user)):
    sessions = (
        await InterviewSession.find(InterviewSession.user_id == str(user.id))
        .sort(-InterviewSession.created_at)
        .to_list()
    )
    return [s.to_api_dict(include_answers=False) for s in sessions]


@interview_router.get("/sessions/{session_id}")
async def get_session(session_id: str, user: User = Depends(get_current_user)):
    session = await InterviewSession.get(session_id)
    if not session or session.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")
    return session.to_api_dict()


class AnswerRequest(BaseModel):
    index: int
    answer: str = ""


@interview_router.post("/sessions/{session_id}/answer")
async def answer_question(
    session_id: str,
    payload: AnswerRequest,
    user: User = Depends(get_current_user),
):
    session = await InterviewSession.get(session_id)
    if not session or session.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")
    if payload.index < 0 or payload.index >= len(session.questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    qref = session.questions[payload.index]
    qref.user_answer = payload.answer
    feedback = compute_answer_feedback(qref.model_dump(by_alias=True), payload.answer)
    qref.feedback = feedback
    session.questions[payload.index] = qref
    session.current_index = min(payload.index + 1, len(session.questions) - 1)
    session.updated_at = datetime.now(timezone.utc)
    await session.save()
    return {"feedback": feedback, "nextIndex": session.current_index}


@interview_router.post("/sessions/{session_id}/complete")
async def complete_session(session_id: str, user: User = Depends(get_current_user)):
    session = await InterviewSession.get(session_id)
    if not session or session.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Session not found")

    answered = [q for q in session.questions if q.feedback and q.feedback.get("score", 0) > 0]
    strengths: List[str] = []
    improvements: List[str] = []
    if not answered:
        raise HTTPException(status_code=400, detail="Answer at least one question before completing")

    comm_scores, tech_scores, struct_scores = [], [], []
    for q in answered:
        fb = q.feedback or {}
        comm_scores.append(int(fb.get("communication", 0)))
        tech_scores.append(int(fb.get("technical_coverage", 0)))
        struct_scores.append(int(fb.get("answer_structure", 0)))
        for s in fb.get("strengths", [])[:1]:
            if s not in strengths:
                strengths.append(s)
        for imp in fb.get("improvements", [])[:1]:
            if imp not in improvements:
                improvements.append(imp)

    def avg(scores):
        return round(sum(scores) / max(len(scores), 1))

    communication = avg(comm_scores)
    technical = avg(tech_scores)
    structure = avg(struct_scores)
    overall = round(0.4 * technical + 0.35 * communication + 0.25 * structure)

    session.feedback = SessionFeedback(
        communication=communication,
        technical_coverage=technical,
        answer_structure=structure,
        overall=overall,
        strengths=strengths[:5],
        improvements=improvements[:5],
    )
    session.status = "completed"
    session.updated_at = datetime.now(timezone.utc)
    await session.save()

    from app.models.notification_model import Notification
    await Notification(
        user_id=str(user.id),
        type="ai",
        title="Interview completed",
        message=f"Your {session.title} is complete. Overall score: {overall}.",
        link=f"/interview/reports/{session.id}",
    ).insert()

    return session.to_api_dict()