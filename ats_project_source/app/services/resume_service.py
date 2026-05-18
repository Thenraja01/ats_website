"""Resume file handling service."""

import aiofiles
from pathlib import Path
from typing import Optional
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ResumeService:
    """Handle resume file operations."""

    @staticmethod
    async def save_resume(file_content: bytes, filename: str) -> Path:
        """Save uploaded resume file."""
        try:
            file_path = settings.RESUMES_DIR / filename
            async with aiofiles.open(file_path, "wb") as f:
                await f.write(file_content)
            logger.info(f"Resume saved: {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Error saving resume: {str(e)}")
            raise

    @staticmethod
    async def delete_resume(filename: str) -> bool:
        """Delete resume file."""
        try:
            file_path = settings.RESUMES_DIR / filename
            if file_path.exists():
                file_path.unlink()
                logger.info(f"Resume deleted: {file_path}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting resume: {str(e)}")
            raise

    @staticmethod
    def get_resume_path(filename: str) -> Optional[Path]:
        """Get resume file path."""
        file_path = settings.RESUMES_DIR / filename
        if file_path.exists():
            return file_path
        return None
