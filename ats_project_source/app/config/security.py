"""Security configuration."""

import os
from datetime import timedelta

class SecurityConfig:
    """Security configuration for JWT and authentication."""

    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # CORS settings
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]

    @classmethod
    def get_access_token_expire(cls) -> timedelta:
        """Get access token expiration time."""
        return timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)

    @classmethod
    def get_refresh_token_expire(cls) -> timedelta:
        """Get refresh token expiration time."""
        return timedelta(days=cls.REFRESH_TOKEN_EXPIRE_DAYS)


security_config = SecurityConfig()
