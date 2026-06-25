"""Application settings and configuration."""

import os
from pathlib import Path
from typing import List

class Settings:
    """Application configuration."""

    # Project paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    APP_DIR: Path = BASE_DIR / "app"
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOADS_DIR: Path = APP_DIR / "uploads"
    RESUMES_DIR: Path = UPLOADS_DIR / "resumes"
    TEMP_DIR: Path = UPLOADS_DIR / "temp"

    # App settings
    PROJECT_NAME: str = "ATS Resume Analyzer"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # File upload settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_RESUME_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt"]
    ALLOWED_RESUME_TYPES: List[str] = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
    ]

    # CSV path for job descriptions
    JOBS_CSV_PATH: Path = DATA_DIR / "jobs.csv"

    # Ensure upload directories exist
    @classmethod
    def setup_directories(cls) -> None:
        """Create necessary directories if they don't exist."""
        for directory in [cls.RESUMES_DIR, cls.TEMP_DIR]:
            directory.mkdir(parents=True, exist_ok=True)


# Create settings instance
settings = Settings()
settings.setup_directories()
