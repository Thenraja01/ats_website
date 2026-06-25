from fastapi import APIRouter, Depends
from app.dependencies.role_dependency import require_roles

candidate_router = APIRouter(
    prefix="/candidate",
    tags=["Candidate"]
)

@candidate_router.get("/dashboard")
async def candidate_dashboard(
    user = Depends(
        require_roles(["candidate"])
    )
):
    return {
        "message": f"Welcome Candidate {user.name}"
    }
