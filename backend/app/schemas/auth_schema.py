from pydantic import BaseModel, EmailStr
from app.core.roles import UserRole

class SignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class LoginSchema(BaseModel):
    email: EmailStr
    password: str