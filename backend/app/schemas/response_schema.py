"""Standard API response wrapper."""

from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Unified API response envelope."""
    success: bool = True
    message: str = "OK"
    data: Optional[Any] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    version: str = "1.0.0"
