"""Health check routes."""

from fastapi import APIRouter
from app.schemas.response_schema import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        message="ATS API is running",
    )


@router.get("/", response_model=dict)
async def root():
    """Root endpoint."""
    return {
        "message": "ATS Resume Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health/",
            "resume": "/api/resume/upload/",
            "ats": "/api/ats/analyze/",
            "auth": "/api/auth/login/",
            "admin": "/api/admin/statistics/",
        },
    }
