"""Candidate router — resume management and application submission.

Spec: HireMind AI — one user type (USER). All endpoints derive the
authenticated user from JWT and validate ownership via resource.user_id.
No RBAC, no role checking.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from typing import List
from pydantic import BaseModel
from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User
from app.models.resume_model import Resume
from app.models.application_model import Application, TimelineEvent
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.core.config import settings
from app.utils.validators import sanitize_filename, validate_mime_type
from app.utils.logger import get_logger

logger = get_logger(__name__)

candidate_router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


@candidate_router.get("")
async def list_resumes(user: User = Depends(get_current_user)):
    """List all resumes for the authenticated user."""
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


@candidate_router.post("")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload and parse a resume (PDF, DOCX, TXT)."""
    contents = await file.read()
    filename = file.filename or ""

    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
        )

    filename = sanitize_filename(filename)

    allowed_mimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]
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


@candidate_router.delete("/{resume_id}")
async def delete_resume(resume_id: str, user: User = Depends(get_current_user)):
    """Delete a resume owned by the authenticated user."""
    resume = await Resume.get(resume_id)
    if not resume or resume.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Resume not found")
    await resume.delete()
    return {"message": "Resume deleted"}