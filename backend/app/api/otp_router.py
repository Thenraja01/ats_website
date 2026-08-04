"""OTP router — email-based one-time password authentication."""

from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime, timedelta, timezone
from typing import Dict
import secrets
import string
from collections import defaultdict

from app.models.otp_model import OTPCode
from app.models.user_model import User
from app.services.email_service import send_otp_email
from app.core.security import create_access_token
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

otp_router = APIRouter(prefix="/auth", tags=["Auth"])

# In-memory rate-limiting store (per-IP).  In production, use Redis.
MAX_OTP_REQUESTS = 5
OTP_WINDOW_SECONDS = 300  # 5-minute sliding window

_rate_limit_store: Dict[str, list] = defaultdict(list)


def _get_client_ip(request: Request) -> str:
    """Best-effort client IP extraction."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(client_ip: str):
    """Raise HTTPException if the client has exceeded the OTP request limit."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=OTP_WINDOW_SECONDS)
    # Prune old entries
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip] if ts > window_start
    ]
    if len(_rate_limit_store[client_ip]) >= MAX_OTP_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many OTP requests. Please try again later.",
        )
    _rate_limit_store[client_ip].append(now)


def generate_otp(length: int = 6) -> str:
    """Generate a cryptographically secure OTP."""
    return "".join(secrets.choice(string.digits) for _ in range(length))


@otp_router.post("/send-otp")
async def send_otp(request: Request, data: dict):
    client_ip = _get_client_ip(request)
    _check_rate_limit(client_ip)

    email = data.get("email", "").strip().lower()
    purpose = data.get("purpose", "signup")

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    if purpose == "signup":
        existing = await User.find_one(User.email == email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    existing_otps = await OTPCode.find(
        OTPCode.email == email,
        OTPCode.purpose == purpose,
        OTPCode.used == False,
        OTPCode.expires_at > datetime.now(timezone.utc),
    ).to_list()
    for otp in existing_otps:
        otp.used = True
        await otp.save()

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )

    otp_record = OTPCode(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=expires_at,
    )
    await otp_record.insert()

    sent = await send_otp_email(email, code, purpose)
    if not sent:
        logger.warning(f"Email sending failed for {email}, but OTP stored")

    return {
        "message": "OTP sent to email",
        "expires_in_minutes": settings.OTP_EXPIRE_MINUTES,
    }


@otp_router.post("/verify-otp")
async def verify_otp(request: Request, data: dict):
    client_ip = _get_client_ip(request)
    _check_rate_limit(client_ip)

    email = data.get("email", "").strip().lower()
    code = data.get("code", "").strip()
    purpose = data.get("purpose", "signup")

    if not email or not code:
        raise HTTPException(status_code=400, detail="Email and code are required")

    otp_record = await OTPCode.find_one(
        OTPCode.email == email,
        OTPCode.code == code,
        OTPCode.purpose == purpose,
        OTPCode.used == False,
        OTPCode.expires_at > datetime.now(timezone.utc),
    )

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp_record.used = True
    await otp_record.save()

    return {"message": "OTP verified", "verified": True}
