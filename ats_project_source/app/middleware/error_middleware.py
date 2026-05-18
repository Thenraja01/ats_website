"""Error handling middleware."""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle application errors."""
    logger.error(f"Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"},
    )
