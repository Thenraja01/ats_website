"""Admin routes."""

from fastapi import APIRouter, HTTPException
from app.controllers.admin_controller import AdminController
from app.schemas.response_schema import APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])
controller = AdminController()


@router.get("/statistics/", response_model=APIResponse)
async def get_statistics():
    """Get system statistics."""
    try:
        result = controller.get_statistics()
        return APIResponse(
            success=result["success"],
            message="Statistics fetched successfully",
            data=result["data"],
            status_code=200,
        )
    except Exception as e:
        logger.error(f"Error in get_statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
