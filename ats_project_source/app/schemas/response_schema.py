"""Response schemas."""

from pydantic import BaseModel
from typing import Any, Optional, List


class APIResponse(BaseModel):
    """Standard API response schema."""

    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
    status_code: int = 200


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str
    message: str
