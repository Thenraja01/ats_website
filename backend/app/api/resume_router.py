"""Resume router — upload and ATS analysis endpoints.

Spec: HireMind AI — one user type (USER).
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Request
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from app.utils.logger import get_logger
from app.schemas.resume_schemas import AnalyzeRequest, ATSResult
from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx, extract_structured_resume_data
from app.core.config import settings
from app.services.ats_service import run_ats_pipeline
from app.models.upload_model import UploadRecord
from app.models.analysis_model import AnalysisResult
from app.crud.analysis_crud import AnalysisCRUD
from app.dependencies.auth_dependency import get_optional_current_user, get_current_user
from app.models.user_model import User
from app.utils.validators import sanitize_filename, validate_mime_type
from fastapi.responses import StreamingResponse
from app.services.font_service import get_filtered_fonts
from app.services.docx_export_service import generate_resume_docx

logger = get_logger(__name__)

resume_router = APIRouter(prefix="/resume", tags=["Resume"])


@resume_router.get("/fonts")
async def get_fonts_metadata(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "popularity",
    limit: int = 60,
    offset: int = 0
):
    """Retrieve backend-driven Google Fonts metadata with category filtering & caching."""
    return await get_filtered_fonts(
        category=category,
        search=search,
        sort=sort,
        limit=limit,
        offset=offset
    )


@resume_router.post("/export-docx")
async def export_resume_docx(
    request: Request,
    payload: Dict[str, Any]
):
    """Export structured resume data to a native Microsoft Word (.docx) document."""
    try:
        resume_data = payload.get("resumeData", payload)
        options = payload.get("options", {})
        stream = generate_resume_docx(resume_data, options)
        
        filename = (resume_data.get("personalInfo", {}).get("fullName") or "Resume").replace(" ", "_")
        filename = f"{filename}.docx"

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"DOCX export error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Word document: {str(e)}")



@resume_router.post("/parse-structured")
async def parse_structured_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Upload a resume (PDF, DOCX, TXT, JSON) and extract structured Resume Studio JSON."""
    try:
        contents = await file.read()
        filename = file.filename or ""
        filename = sanitize_filename(filename)

        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
            )

        # JSON file direct parse
        if filename.endswith(".json"):
            import json
            try:
                data = json.loads(contents.decode("utf-8", errors="ignore"))
                return {"filename": filename, "structured": data}
            except Exception as e:
                raise HTTPException(status_code=400, detail="Invalid JSON file format")

        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            text = extract_text_from_docx(contents)
        elif filename.endswith(".txt"):
            text = contents.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported format. Supported: .pdf, .docx, .doc, .txt, .json",
            )

        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in the document")

        structured = extract_structured_resume_data(text)
        return {"filename": filename, "extracted_text": text, "structured": structured}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Structured parse error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume document: {str(e)}")



@resume_router.post("/upload")
async def upload_resume(
    request: Request,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Upload a resume (PDF/DOCX/TXT) and extract text."""
    try:
        user_id = str(current_user.id) if current_user else None
        ip_address = request.client.host if request.client else None

        contents = await file.read()
        filename = file.filename or ""
        filename = sanitize_filename(filename)

        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB",
            )

        allowed_mimes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]
        if not validate_mime_type(contents, allowed_mimes):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file content. Use a valid PDF, DOCX, or TXT file.",
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

        # ── Store raw file in MinIO S3 Object Storage ────────────────
        import uuid
        user_folder = user_id if user_id else "guest"
        unique_key = f"resumes/{user_folder}/{uuid.uuid4().hex}_{filename}"
        content_type = file.content_type or "application/octet-stream"
        minio_key = None
        try:
            from app.services.storage_service import upload_file_bytes
            minio_key = upload_file_bytes(contents, unique_key, content_type=content_type)
        except Exception as storage_err:
            logger.warning(f"MinIO storage error: {storage_err}")

        await UploadRecord(user_id=user_id, ip_address=ip_address).insert()
        return {
            "filename": filename,
            "extracted_text": text,
            "storage_key": minio_key,
            "stored_in_minio": minio_key is not None,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during resume parsing")



@resume_router.post("/analyze", response_model=ATSResult)
async def analyze_resume(
    request: AnalyzeRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    req: Request = None,
):
    """Run the LLM ATS pipeline on resume text vs job description and persist result."""
    try:
        result = run_ats_pipeline(request.resume_text, request.jd_text)

        user_id = str(current_user.id) if current_user else None
        ip_address = req.client.host if req and req.client else None

        analysis = AnalysisResult(
            user_id=user_id,
            ip_address=ip_address,
            role="user",
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

        result["id"] = str(analysis.id)
        return result

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred during ATS analysis")


@resume_router.get("/result/{analysis_id}", response_model=ATSResult)
async def get_analysis_result(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
):
    """Get a specific analysis result by ID. Enforces ownership."""
    analysis = await AnalysisCRUD.get_by_id(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

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
    """Get the current user's analysis history."""
    limit = min(limit, 100)
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
    stats = await AnalysisCRUD.get_user_stats(str(current_user.id))
    return stats


@resume_router.get("/me")
async def get_my_resume(current_user: User = Depends(get_current_user)):
    """Retrieve current authenticated user's active resume and metadata."""
    from app.models.resume_version_model import ResumeVersion
    resume = (
        await ResumeVersion.find(ResumeVersion.user_id == str(current_user.id))
        .sort(-ResumeVersion.created_at)
        .first_or_none()
    )
    if not resume:
        return {"status": "empty", "message": "No resumes created yet", "data": None}
    return resume.to_api_dict()


@resume_router.get("/download/{object_key:path}")
async def get_resume_download_url(
    object_key: str,
    current_user: User = Depends(get_current_user),
):
    """Generate a presigned MinIO URL to download a stored resume."""
    from app.services.storage_service import get_presigned_download_url
    url = get_presigned_download_url(object_key)
    return {"download_url": url, "object_key": object_key}

