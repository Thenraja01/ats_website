"""Authentication dependencies — JWT token verification."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.models.user_model import User
from app.core.config import settings

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Decode JWT and return the authenticated user. Raises 401 on failure."""
    token = credentials.credentials

    try:
        from jose import jwt

        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("id")

        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
):
    """Decode JWT if present. Returns None for unauthenticated (guest) users."""
    if not credentials:
        return None

    token = credentials.credentials
    try:
        from jose import jwt

        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("id")
        user = await User.get(user_id)
        return user
    except JWTError:
        return None