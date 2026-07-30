"""Admin router — organization management and system-wide stats."""

from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.organization_model import Organization
from app.models.job_model import JobDescription
from app.models.application_model import Application
from app.models.analysis_model import AnalysisResult
from app.core.roles import UserRole
from app.utils.logger import get_logger

logger = get_logger(__name__)

admin_router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@admin_router.get("/stats")
async def get_stats(user: User = Depends(require_roles(["organization_admin"]))):
    total_users = await User.find_all().count()
    total_analyses = await AnalysisResult.find_all().count()
    total_jobs = await JobDescription.find_all().count()
    total_applications = await Application.find_all().count()

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
    }


@admin_router.get("/candidates")
async def list_candidates(user: User = Depends(require_roles(["organization_admin"]))):
    candidates = (
        await User.find(User.role == UserRole.CANDIDATE)
        .to_list()
    )
    result = []
    for c in candidates:
        analysis_count = await AnalysisResult.find(
            AnalysisResult.user_id == str(c.id)
        ).count()
        result.append({
            "id": str(c.id),
            "name": c.name,
            "email": c.email,
            "total_analyses": analysis_count,
        })
    return result


@admin_router.get("/top-candidates")
async def get_top_candidates(user: User = Depends(require_roles(["organization_admin"]))):
    pipeline = [
        {"$group": {"_id": "$user_id", "avg_score": {"$avg": "$ats_score"}, "count": {"$sum": 1}}},
        {"$sort": {"avg_score": -1}},
        {"$limit": 20},
    ]
    top = await AnalysisResult.aggregate(pipeline).to_list()
    result = []
    for t in top:
        if t["_id"]:
            u = await User.get(t["_id"])
            result.append({
                "user_id": t["_id"],
                "name": u.name if u else "Unknown",
                "email": u.email if u else "",
                "average_ats_score": round(t["avg_score"], 1),
                "total_analyses": t["count"],
            })
    return result


# ── Organization Management ─────────────────────────


@admin_router.get("/organizations")
async def list_organizations(user: User = Depends(require_roles(["organization_admin"]))):
    orgs = await Organization.find_all().to_list()
    return [
        {
            "id": str(o.id),
            "name": o.name,
            "description": o.description,
            "website": o.website,
            "created_at": o.created_at,
        }
        for o in orgs
    ]


@admin_router.post("/organizations")
async def create_organization(
    data: dict,
    user: User = Depends(require_roles(["organization_admin"])),
):
    org = Organization(
        name=data.get("name", ""),
        description=data.get("description"),
        website=data.get("website"),
        admin_id=str(user.id),
    )
    await org.insert()
    return {"id": str(org.id), "name": org.name, "message": "Organization created"}


@admin_router.put("/organizations/{org_id}")
async def update_organization(
    org_id: str,
    data: dict,
    user: User = Depends(require_roles(["organization_admin"])),
):
    org = await Organization.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    for field in ["name", "description", "website"]:
        if field in data:
            setattr(org, field, data[field])

    await org.save()
    return {"message": "Organization updated"}


@admin_router.delete("/organizations/{org_id}")
async def delete_organization(
    org_id: str,
    user: User = Depends(require_roles(["organization_admin"])),
):
    org = await Organization.get(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    await org.delete()
    return {"message": "Organization deleted"}


# ── Recruiter Management ────────────────────────────


@admin_router.get("/recruiters")
async def list_recruiters(user: User = Depends(require_roles(["organization_admin"]))):
    recruiters = (
        await User.find(User.role == UserRole.RECRUITER)
        .to_list()
    )
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "email": r.email,
        }
        for r in recruiters
    ]


@admin_router.put("/recruiters/{recruiter_id}")
async def update_recruiter_role(
    recruiter_id: str,
    data: dict,
    user: User = Depends(require_roles(["organization_admin"])),
):
    recruiter = await User.get(recruiter_id)
    if not recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    if "organization_id" in data:
        recruiter.organization_id = data["organization_id"]
        await recruiter.save()

    return {"message": "Recruiter updated"}