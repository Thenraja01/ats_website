"""Admin controller."""

from typing import Dict, Any
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AdminController:
    """Controller for admin operations."""

    def get_statistics(self) -> Dict[str, Any]:
        """Get system statistics."""
        try:
            logger.info("Fetching statistics")
            return {
                "success": True,
                "data": {
                    "total_resumes": 0,
                    "total_analyses": 0,
                    "average_score": 0.0,
                },
            }
        except Exception as e:
            logger.error(f"Error in get_statistics: {str(e)}")
            raise
