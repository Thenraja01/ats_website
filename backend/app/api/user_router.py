"""User router — profile and user management endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.crud.user_crud import UserCRUD
from app.schemas.user_schema import UserResponse
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_dependency import require_roles
from app.models.user_model import User

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }


@user_router.get("/", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(require_roles(["recruiter"])),
):
    """List all users. Recruiter access required."""
    users = await UserCRUD.get_all()
    return [
        {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
        for user in users
    ]


@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    current_user: User = Depends(require_roles(["recruiter"])),
):
    """Get a user by ID. Recruiter access required."""
    user = await UserCRUD.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
