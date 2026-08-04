from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.schemas.auth_schema import (
    SignupSchema,
    LoginSchema
)
from app.models.otp_model import OTPCode
from app.services.auth_service import (
    register_user,
    login_user
)

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post("/signup")
async def signup(data: SignupSchema, otp_code: str = None):
    """Register a new user. Requires a valid, unused OTP for the email."""
    if not otp_code:
        raise HTTPException(
            status_code=400,
            detail="OTP verification is required"
        )

    otp_record = await OTPCode.find_one(
        OTPCode.email == data.email,
        OTPCode.code == otp_code,
        OTPCode.purpose == "signup",
        OTPCode.used == False,
        OTPCode.expires_at > datetime.now(timezone.utc),
    )

    if not otp_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    otp_record.used = True
    await otp_record.save()

    user = await register_user(data)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    return {
        "message": "Account created"
    }


@auth_router.post("/login")
async def login(data: LoginSchema):

    token = await login_user(data)

    if not token:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )
    return {
        "access_token": token,
        "token_type": "bearer",
    }
