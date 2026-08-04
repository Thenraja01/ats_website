"""Resume file handling service."""

import os
import secrets
from pathlib import Path
from app.utils.logger import get_logger

logger = get_logger(__name__)

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


async def save_resume(filename: str, contents: bytes) -> str:
    """Save uploaded resume file to disk. Returns the saved file path."""
    # Generate a safe random filename to prevent path traversal and collisions
    safe_filename = f"{secrets.token_hex(8)}_{filename}"
    safe_filename = safe_filename.replace("/", "_").replace("\\", "_").replace("..", "_")
    file_path = UPLOAD_DIR / safe_filename
    # Ensure the resolved path stays within UPLOAD_DIR
    if not str(file_path.resolve()).startswith(str(UPLOAD_DIR.resolve())):
        raise ValueError("Invalid file path")
    with open(file_path, "wb") as f:
        f.write(contents)
    logger.info(f"Resume saved: {file_path}")
    return str(file_path)


async def delete_resume(filename: str) -> bool:
    """Delete a saved resume file."""
    safe_filename = os.path.basename(filename)
    file_path = UPLOAD_DIR / safe_filename
    if not str(file_path.resolve()).startswith(str(UPLOAD_DIR.resolve())):
        raise ValueError("Invalid file path")
    if file_path.exists():
        os.remove(file_path)
        logger.info(f"Resume deleted: {file_path}")
        return True
    return False
