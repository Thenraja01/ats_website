"""Database configuration."""

import os
from typing import Optional


class DatabaseConfig:
    """Database configuration for MongoDB, ChromaDB, and Redis."""

    # MongoDB settings
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "ats_db")

    # ChromaDB settings
    CHROMA_DB_PATH: str = os.getenv("CHROMA_DB_PATH", "./chromadb_data")
    CHROMADB_HOST: str = os.getenv("CHROMADB_HOST", "localhost")
    CHROMADB_PORT: int = int(os.getenv("CHROMADB_PORT", "8000"))

    # Redis settings
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))

    # AI Model settings
    HF_MODEL_NAME: str = os.getenv("HF_MODEL_NAME", "meta-llama/Meta-Llama-3-8B-Instruct")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5")
    HF_API_TOKEN: str = os.getenv("HF_API_TOKEN", "")

    # Celery settings
    CELERY_BROKER_URL: str = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

    @classmethod
    def get_mongodb_uri(cls) -> str:
        """Get MongoDB connection URI."""
        return cls.MONGO_URI

    @classmethod
    def get_chromadb_config(cls) -> dict:
        """Get ChromaDB configuration."""
        return {
            "host": cls.CHROMADB_HOST,
            "port": cls.CHROMADB_PORT,
            "persist_directory": cls.CHROMA_DB_PATH,
        }

    @classmethod
    def get_redis_url(cls) -> str:
        """Get Redis URL."""
        return cls.REDIS_URL


db_config = DatabaseConfig()
