"""Database initialization using Motor (async MongoDB) and Beanie ODM."""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user_model import User
from app.models.upload_model import UploadRecord
from app.core.config import settings


if not hasattr(AsyncIOMotorClient, "append_metadata"):
    AsyncIOMotorClient.append_metadata = lambda *args, **kwargs: None

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]


async def init_db():
    """Initialize Beanie with all document models."""
    await init_beanie(
        database=db,
        document_models=[User, UploadRecord],
    )