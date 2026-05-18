"""Authentication controller."""

from typing import Dict, Any
from app.services.auth_service import AuthService
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthController:
    """Controller for authentication operations."""

    def __init__(self):
        """Initialize controller."""
        self.auth_service = AuthService()

    def register(self, email: str, password: str, full_name: str) -> Dict[str, Any]:
        """Register new user."""
        try:
            logger.info(f"Registering user: {email}")
            # Implement registration logic
            return {"success": True, "message": "User registered successfully"}
        except Exception as e:
            logger.error(f"Error in register: {str(e)}")
            raise

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Login user."""
        try:
            logger.info(f"Logging in user: {email}")
            # Implement login logic
            token = self.auth_service.create_access_token(email)
            return {"success": True, "token": token}
        except Exception as e:
            logger.error(f"Error in login: {str(e)}")
            raise
