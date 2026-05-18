"""Resume upload and analysis routes."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.controllers.resume_controller import ResumeController
from app.schemas.resume_schema import ResumeResponse, ResumeAnalysis
from app.schemas.response_schema import APIResponse
from app.utils.validators import validate_file_extension, validate_email
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/resume", tags=["resume"])
controller = ResumeController()


@router.post("/upload/", response_model=APIResponse)
async def upload_resume(
    file: UploadFile = File(...),
    name: str = Form(...),
    email: str = Form(...),
    job_description: Optional[str] = Form(None),
    job_id: int = Form(1),
):
    """Upload and analyze resume."""
    try:
        # Validate email
        if not validate_email(email):
            raise HTTPException(status_code=400, detail="Invalid email address")

        # Validate file extension
        if not validate_file_extension(file.filename, settings.ALLOWED_RESUME_EXTENSIONS):
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

        # Validate file size
        file_content = await file.read()
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=413, detail="File size exceeds maximum allowed")

        # Reset file pointer
        await file.seek(0)

        # Process resume
        result = await controller.upload_and_analyze(
            file=file,
            name=name,
            email=email,
            job_description=job_description or "",
            job_id=job_id,
        )

        return APIResponse(
            success=result["success"],
            message="Resume uploaded and analyzed successfully",
            data=result["data"],
            status_code=200,
        )

    except HTTPException as e:
        logger.error(f"HTTP error in upload_resume: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error in upload_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
