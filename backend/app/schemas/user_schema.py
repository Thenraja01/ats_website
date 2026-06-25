"""User schema — response model only (auth schemas in auth_schema.py)."""

from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """User data returned in API responses."""
    id: str
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True