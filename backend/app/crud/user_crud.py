from app.models.user_model import User
from app.schemas.auth_schema import SignupSchema
from app.core.security import hash_password
from typing import List, Optional
from bson import ObjectId

class UserCRUD:
    @staticmethod
    async def get_by_email(email: str) -> Optional[User]:
        return await User.find_one(User.email == email)

    @staticmethod
    async def get_by_id(user_id: str) -> Optional[User]:
        return await User.get(user_id)

    @staticmethod
    async def create(data: SignupSchema) -> User:
        user = User(
            name=data.name,
            email=data.email,
            password=hash_password(data.password),
            role=data.role
        )
        await user.insert()
        return user

    @staticmethod
    async def get_all() -> List[User]:
        return await User.find_all().to_list()

    @staticmethod
    async def update(user_id: str, update_data: dict) -> Optional[User]:
        user = await User.get(user_id)
        if user:
            await user.set(update_data)
            return user
        return None

    @staticmethod
    async def delete(user_id: str) -> bool:
        user = await User.get(user_id)
        if user:
            await user.delete()
            return True
        return False
