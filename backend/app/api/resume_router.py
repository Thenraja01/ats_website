"""Resume router — upload and ATS analysis endpoints."""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from datetime import datetime, timezone

from app.schemas.resume_schemas import AnalyzeRequest, ATSResult
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.services.ats_service import run_ats_pipeline
from app.models.upload_model import UploadRecord
from app.dependencies.auth_dependency import get_optional_current_user
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
def analyze_resume(request: AnalyzeRequest):
    """Run the LLM ATS pipeline on resume text vs job description."""
    try:
        result = run_ats_pipeline(request.resume_text, request.jd_text)
        return result
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
