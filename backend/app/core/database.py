from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user_model import User
from app.models.upload_model import UploadRecord
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URL)

db = client.fastapi_auth

async def init_db():
    await init_beanie(
        database=db,
        document_models=[User, UploadRecord]
    )