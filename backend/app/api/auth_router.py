from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user_model import User
from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies.auth_dependency import get_current_user

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


@auth_router.post("/login")
async def login(data: LoginRequest):
    email = data.email.strip().lower()
    user = await User.find_one(User.email == email)
    if not user or not user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(data={"id": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        },
    }


@auth_router.post("/register")
async def register(data: RegisterRequest):
    email = data.email.strip().lower()
    name = data.name.strip()
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name must be at least 2 characters",
        )
    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters",
        )

    existing_user = await User.find_one(User.email == email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    hashed_pwd = hash_password(data.password)

    user = User(
        name=name,
        email=email,
        password=hashed_pwd,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    await user.insert()

    token = create_access_token(data={"id": str(user.id), "email": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        },
    }


@auth_router.post("/verify-otp")
async def verify_otp(data: dict):
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and OTP are required",
        )

    # In a real app, verify OTP against what was sent
    # For now, accept any 6-digit OTP
    if not otp.isdigit() or len(otp) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP format",
        )

    user = await User.find_one(User.email == email.lower())
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {"status": "verified", "user": {"id": str(user.id), "email": user.email}}


@auth_router.get("/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
    }