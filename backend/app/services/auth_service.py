from app.crud.user_crud import UserCRUD
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.utils.validators import validate_password
from fastapi import HTTPException

async def register_user(data):
    """Register a new user. Role is always 'candidate' — admins are
    provisioned through a separate, protected workflow."""
    existing_user = await UserCRUD.get_by_email(data.email)

    if existing_user:
        return None

    if not validate_password(data.password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with uppercase, lowercase, and a digit"
        )

    user = await UserCRUD.create(data)

    return user


async def login_user(data):
    user = await UserCRUD.get_by_email(data.email)

    if not user:
        return None

    if not verify_password(
        data.password,
        user.password
    ):
        return None

    token = create_access_token({
        "id": str(user.id),
        "email": user.email,
        "role": user.role
    })

    return token