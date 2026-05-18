"""ATS scoring service."""

from typing import List
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ATSService:
    """Main ATS scoring service."""

    @staticmethod
    def analyze_resume(resume_text: str, job_description: str) -> dict:
        """Analyze resume against job description."""
        # This is a placeholder for main ATS analysis
        logger.info("Analyzing resume")
        return {
            "score": 0.0,
            "feedback": "",
            "suggestions": [],
        }
