import secrets
from pydantic_settings import BaseSettings
from pydantic import model_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "HireMind AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database & Cache
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "hiremind_ai"
    REDIS_URL: str = "redis://127.0.0.1:6379/0"

    # Ollama Local AI
    OLLAMA_URL: str = "http://127.0.0.1:11434"
    OLLAMA_CHAT_MODEL: str = "llama3.2"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    # MinIO S3 Storage
    MINIO_ENDPOINT: str = "127.0.0.1:9000"
    MINIO_BUCKET: str = "hiremind-documents"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_SECURE: bool = False

    # AI Keys
    GROQ_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"

    # Security
    SECRET_KEY: str = "hiremind-ai-secret-development-key-2026-auth"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days (10080 minutes)
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB

    # SMTP / Email
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@hiremind.ai"
    SMTP_USE_TLS: bool = True

    # OTP
    OTP_EXPIRE_MINUTES: int = 10

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @model_validator(mode="after")
    def check_security(self):
        """Warn about insecure configuration at startup."""
        if not self.GROQ_API_KEY:
            import warnings
            warnings.warn("GROQ_API_KEY is not set — ATS analysis will fail.", stacklevel=2)
        return self


settings = Settings()
