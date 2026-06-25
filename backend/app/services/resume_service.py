"""Resume file handling service."""

import os
from pathlib import Path
from typing import Optional
from app.utils.logger import get_logger

logger = get_logger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_resume(filename: str, contents: bytes) -> str:
    """Save uploaded resume file to disk. Returns the saved file path."""
    file_path = UPLOAD_DIR / filename
    with open(file_path, "wb") as f:
        f.write(contents)
    logger.info(f"Resume saved: {file_path}")
    return str(file_path)


async def delete_resume(filename: str) -> bool:
    """Delete a saved resume file."""
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        os.remove(file_path)
        logger.info(f"Resume deleted: {file_path}")
        return True
    return False
