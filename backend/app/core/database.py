"""Database initialization using Motor (async MongoDB) and Beanie ODM."""

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.models.user_model import User
from app.models.upload_model import UploadRecord
from app.models.analysis_model import AnalysisResult
from app.models.job_model import JobDescription
from app.models.application_model import Application
from app.models.resume_model import Resume
from app.models.otp_model import OTPCode
from app.models.career_model import CareerProfile
from app.models.resume_version_model import ResumeVersion
from app.models.interview_model import InterviewQuestion, InterviewSession, SavedQuestion
from app.models.document_model import DocumentRecord
from app.models.notification_model import Notification
from app.core.config import settings


if not hasattr(AsyncIOMotorClient, "append_metadata"):
    AsyncIOMotorClient.append_metadata = lambda *args, **kwargs: None

client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]


async def init_db():
    """Initialize Beanie with all user-owned document models."""
    await init_beanie(
        database=db,
        document_models=[
            User,
            UploadRecord,
            AnalysisResult,
            JobDescription,
            Application,
            Resume,
            OTPCode,
            CareerProfile,
            ResumeVersion,
            InterviewQuestion,
            InterviewSession,
            SavedQuestion,
            DocumentRecord,
            Notification,
        ],
    )