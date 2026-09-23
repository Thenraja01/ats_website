from fastapi import APIRouter, HTTPException, Depends, status
import httpx
from datetime import datetime, timezone
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
    role: Optional[str] = "candidate"
    organization_id: Optional[str] = None


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

    token = create_access_token(
        data={"id": str(user.id), "email": user.email, "role": user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "organization_id": user.organization_id,
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

    role = data.role if data.role in ["candidate", "recruiter", "organization_admin"] else "candidate"
    hashed_pwd = hash_password(data.password)

    user = User(
        name=name,
        email=email,
        password=hashed_pwd,
        role=role,
        organization_id=data.organization_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    await user.insert()

    token = create_access_token(
        data={"id": str(user.id), "email": user.email, "role": user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "organization_id": user.organization_id,
        },
    }


@auth_router.post("/google")
async def google_auth(data: dict):
    id_token = data.get("credential")
    role = data.get("role", "candidate")

    if not id_token:
        raise HTTPException(status_code=400, detail="Google credential token is required")

    async with httpx.AsyncClient() as client:
        res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}")
        if res.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        payload = res.json()

    email = payload.get("email")
    name = payload.get("name", "User")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email not provided by Google")

    email = email.lower()
    user = await User.find_one(User.email == email)
    
    if not user:
        user = User(
            email=email,
            name=name,
            role=role,
            password="",  # OAuth users don't have passwords
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        await user.insert()

    token = create_access_token(
        data={"id": str(user.id), "email": user.email, "role": user.role}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "organization_id": user.organization_id,
        },
    }


@auth_router.get("/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "organization_id": current_user.organization_id,
    }


