from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import (
    SignupSchema,
    LoginSchema
)

from app.services.auth_service import (
    register_user,
    login_user
)

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

@auth_router.post("/signup")
async def signup(data: SignupSchema):

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
        "access_token": token
    }
