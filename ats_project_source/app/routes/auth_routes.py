"""Authentication routes."""

from fastapi import APIRouter, HTTPException
from app.controllers.auth_controller import AuthController
from app.schemas.auth_schema import UserRegister, UserLogin, Token
from app.schemas.response_schema import APIResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])
controller = AuthController()


@router.post("/register/", response_model=APIResponse)
async def register(request: UserRegister):
    """Register new user."""
    try:
        result = controller.register(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
        )
        return APIResponse(
            success=result["success"],
            message=result.get("message", "User registered successfully"),
            status_code=201,
        )
    except Exception as e:
        logger.error(f"Error in register: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.post("/login/", response_model=APIResponse)
async def login(request: UserLogin):
    """Login user."""
    try:
        result = controller.login(email=request.email, password=request.password)
        return APIResponse(
            success=result["success"],
            message="Login successful",
            data=result,
            status_code=200,
        )
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
