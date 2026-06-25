from pydantic import BaseModel, EmailStr
from typing import Optional

class SignupSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str|bool = False

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True