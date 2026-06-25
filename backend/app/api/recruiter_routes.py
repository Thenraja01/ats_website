from fastapi import APIRouter, Depends
from app.dependencies.role_dependency import require_roles

recruiter_router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"]
)

@recruiter_router.get("/dashboard")
async def recruiter_dashboard(
    user = Depends(
        require_roles(["recruiter"])
    )
):
    return {
        "message": f"Welcome Recruiter {user.name}"
    }
