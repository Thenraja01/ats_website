"""Resume router — upload and ATS analysis endpoints."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from datetime import datetime, timezone
from typing import List, Optional

from app.schemas.resume_schemas import AnalyzeRequest, ATSResult
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.core.config import settings
from app.services.ats_service import run_ats_pipeline
from app.models.upload_model import UploadRecord
from app.models.analysis_model import AnalysisResult
from app.crud.analysis_crud import AnalysisCRUD
from app.dependencies.auth_dependency import get_optional_current_user, get_current_user
from app.models.user_model import User
from app.utils.logger import get_logger

logger = get_logger(__name__)

resume_router = APIRouter(prefix="/resume", tags=["Resume"])

# Daily upload limits by role
LIMITS = {
    "guest": 1,
    "candidate": 3,
    "recruiter": 999999,
}


@resume_router.post("/upload")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_optional_current_user),
):
    """Upload a resume (PDF/DOCX/TXT) and extract text. Rate-limited by role."""
    try:
        # Determine role and identity
        role = "guest"
        user_id = None
        ip_address = request.client.host if request.client else None

        if current_user:
            role = current_user.role
            user_id = str(current_user.id)

        limit = LIMITS.get(role, 0)

        # Check upload counts for today
        start_of_day = datetime.now(timezone.utc).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        if role == "guest":
            upload_count = await UploadRecord.find(
                UploadRecord.ip_address == ip_address,
                UploadRecord.created_at >= start_of_day,
            ).count()
        else:
            upload_count = await UploadRecord.find(
                UploadRecord.user_id == user_id,
                UploadRecord.created_at >= start_of_day,
            ).count()

        if upload_count >= limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily upload limit reached for {role}. Limit: {limit}",
            )

        # Parse the uploaded file
        contents = await file.read()
        filename = file.filename or ""

        # Validate file size
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
            )

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(contents)
        elif filename.endswith(".txt"):
            text = contents.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Use PDF, DOCX, or TXT.",
            )

        # Record upload
        await UploadRecord(user_id=user_id, ip_address=ip_address).insert()

        logger.info(f"Resume uploaded: {filename} by {role}")
        return {"filename": filename, "extracted_text": text}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@resume_router.post("/analyze", response_model=ATSResult)
async def analyze_resume(
    request: AnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    req: Request = None,
):
    """Run the LLM ATS pipeline on resume text vs job description and persist result."""
    try:
        result = run_ats_pipeline(request.resume_text, request.jd_text)

        # Persist analysis result
        user_id = str(current_user.id) if current_user else None
        ip_address = req.client.host if req and req.client else None
        role = current_user.role if current_user else "guest"

        analysis = AnalysisResult(
            user_id=user_id,
            ip_address=ip_address,
            role=role,
            resume_text=request.resume_text,
            jd_text=request.jd_text,
            ats_score=result["ats_score"],
            eligible=result["eligible"],
            missing_skills=result["missing_skills"],
            suggestions=result["suggestions"],
            interview_questions=result["interview_questions"],
            extracted_skills=result["extracted_skills"],
        )
        await AnalysisCRUD.create(analysis)

        # Attach ID to response for frontend navigation
        result["id"] = str(analysis.id)
        logger.info(f"Analysis saved: {analysis.id} for {role}")
        return result

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@resume_router.get("/result/{analysis_id}", response_model=ATSResult)
async def get_analysis_result(analysis_id: str):
    """Get a specific analysis result by ID (public access for result sharing)."""
    analysis = await AnalysisCRUD.get_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": str(analysis.id),
        "ats_score": analysis.ats_score,
        "eligible": analysis.eligible,
        "missing_skills": analysis.missing_skills,
        "suggestions": analysis.suggestions,
        "interview_questions": analysis.interview_questions,
        "extracted_skills": analysis.extracted_skills,
    }


@resume_router.get("/history")
async def get_analysis_history(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    """Get the current user's analysis history (candidates only)."""
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403, detail="Only candidates can access their history"
        )

    analyses = await AnalysisCRUD.get_by_user(str(current_user.id), skip, limit)
    return [
        {
            "id": str(a.id),
            "ats_score": a.ats_score,
            "eligible": a.eligible,
            "missing_skills": a.missing_skills,
            "extracted_skills": a.extracted_skills,
            "created_at": a.created_at,
        }
        for a in analyses
    ]


@resume_router.get("/history/stats")
async def get_analysis_stats(current_user: User = Depends(get_current_user)):
    """Get the current user's analysis statistics."""
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403, detail="Only candidates can access their stats"
        )

    stats = await AnalysisCRUD.get_user_stats(str(current_user.id))
    return stats
