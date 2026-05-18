"""ATS scoring routes."""

from fastapi import APIRouter, HTTPException
from app.controllers.ats_controller import ATSController
from app.schemas.ats_schema import ATSScoreRequest, ATSScoreResponse
from app.schemas.response_schema import APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/ats", tags=["ats"])
controller = ATSController()


@router.post("/analyze/", response_model=APIResponse)
async def analyze_resume(request: ATSScoreRequest):
    """Analyze resume against job description."""
    try:
        result = controller.analyze_resume(
            resume_text=request.resume_text,
            job_description=request.job_description,
            job_id=request.job_id,
        )

        return APIResponse(
            success=result["success"],
            message="Resume analyzed successfully",
            data=result["data"],
            status_code=200,
        )

    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
