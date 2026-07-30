"""OTP Code model for email verification."""

from beanie import Document
from datetime import datetime
from typing import Optional
from pydantic import Field


class OTPCode(Document):
    email: str
    code: str
    purpose: str  # "signup", "login", "password_reset"
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "otp_codes"