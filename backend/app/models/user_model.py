from beanie import Document
from pydantic import EmailStr
from app.core.roles import UserRole

class User(Document):
    name: str
    email: EmailStr
    password: str
    role: UserRole

    class Settings:
        name = "users"