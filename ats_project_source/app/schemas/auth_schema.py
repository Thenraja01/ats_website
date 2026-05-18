"""Authentication schemas."""

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    """User registration schema."""

    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    """User login schema."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Token schema."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefresh(BaseModel):
    """Token refresh schema."""

    refresh_token: str
