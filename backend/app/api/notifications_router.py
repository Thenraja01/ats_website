"""Notifications router — in-app activity notifications."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies.role_dependency import require_roles
from app.models.user_model import User
from app.models.notification_model import Notification

notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])


@notifications_router.get("")
async def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, le=200),
    user: User = Depends(require_roles(["candidate"])),
):
    query = Notification.find(Notification.user_id == str(user.id))
    if unread_only:
        query = query.find(Notification.read == False)  # noqa: E712
    items = await query.sort(-Notification.created_at).limit(limit).to_list()
    return [n.to_api_dict() for n in items]


@notifications_router.get("/unread-count")
async def unread_count(user: User = Depends(require_roles(["candidate"]))):
    count = await Notification.find(
        Notification.user_id == str(user.id),
        Notification.read == False,  # noqa: E712
    ).count()
    return {"count": count}


@notifications_router.post("/{notification_id}/read")
async def mark_read(notification_id: str, user: User = Depends(require_roles(["candidate"]))):
    item = await Notification.get(notification_id)
    if not item or item.user_id != str(user.id):
        raise HTTPException(status_code=404, detail="Notification not found")
    item.read = True
    await item.save()
    return item.to_api_dict()


@notifications_router.post("/read-all")
async def mark_all_read(user: User = Depends(require_roles(["candidate"]))):
    items = await Notification.find(
        Notification.user_id == str(user.id),
        Notification.read == False,  # noqa: E712
    ).to_list()
    for item in items:
        item.read = True
        await item.save()
    return {"message": f"{len(items)} notifications marked as read"}