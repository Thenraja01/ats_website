from app.crud.user_crud import UserCRUD
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)

async def register_user(data):
    existing_user = await UserCRUD.get_by_email(data.email)

    if existing_user:
        return None

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