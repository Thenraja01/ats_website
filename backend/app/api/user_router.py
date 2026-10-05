"""User router — personal profile management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

from app.dependencies.auth_dependency import get_current_user
from app.models.user_model import User

user_router = APIRouter(prefix="/users", tags=["Users"])


class UserUpdateRequest(BaseModel):
    name: str


@user_router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@user_router.put("/me")
async def update_my_profile(
    data: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    """Update name or personal account details."""
    name = data.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
    
    current_user.name = name
    current_user.updated_at = datetime.now(timezone.utc)
    await current_user.save()

    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "updated_at": current_user.updated_at,
    }
