from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.crud.user_crud import UserCRUD
from app.schemas.user_schema import UserResponse, SignupSchema
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_dependency import require_roles
from app.models.user_model import User

user_router = APIRouter(prefix="/users", tags=["Users"])

@user_router.get("/", response_model=List[UserResponse])
async def get_all_users(current_user: User = Depends(require_roles(["admin"]))):
    users = await UserCRUD.get_all()
    # Convert beanie document ID to string for Pydantic response
    return [{"id": str(user.id), "name": user.name, "email": user.email, "role": user.role} for user in users]

@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, current_user: User = Depends(require_roles(["admin", "recruiter"]))):
    user = await UserCRUD.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"id": str(user.id), "name": user.name, "email": user.email, "role": user.role}

@user_router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, update_data: SignupSchema, current_user: User = Depends(require_roles(["admin"]))):
    updated_user = await UserCRUD.update(user_id, update_data.model_dump(exclude_unset=True))
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"id": str(updated_user.id), "name": updated_user.name, "email": updated_user.email, "role": updated_user.role}

@user_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, current_user: User = Depends(require_roles(["admin"]))):
    success = await UserCRUD.delete(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return None
