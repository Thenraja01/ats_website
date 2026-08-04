"""Input validators."""

import re
import os
from typing import List
from pathlib import Path


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_file_extension(filename: str, allowed: List[str]) -> bool:
    """Validate file extension against allowed list."""
    ext = Path(filename).suffix.lower()
    return ext in allowed


def validate_file_size(size: int, max_size: int) -> bool:
    """Validate file size doesn't exceed maximum."""
    return size <= max_size


def validate_password(password: str) -> bool:
    """Validate password strength (min 8 chars, uppercase, lowercase, digit)."""
    if len(password) < 8:
        return False
    if len(password) > 128:
        return False
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    return has_upper and has_lower and has_digit


def sanitize_filename(filename: str) -> str:
    """Strip directory components and dangerous characters from a filename."""
    # Take only the basename (removes any path traversal)
    filename = os.path.basename(filename)
    # Replace non-alphanumeric chars (except dot, dash, underscore) with underscore
    filename = re.sub(r"[^\w\.\-]", "_", filename)
    # Prevent hidden files
    if filename.startswith("."):
        filename = "_" + filename
    # Limit length
    name, ext = os.path.splitext(filename)
    if len(name) > 100:
        name = name[:100]
    return name + ext


def validate_mime_type(file_bytes: bytes, allowed_mimes: List[str]) -> bool:
    """Validate file content by checking magic bytes (first bytes)."""
    if len(file_bytes) < 4:
        return False
    header = file_bytes[:8]
    # PDF
    if header.startswith(b"%PDF"):
        return "application/pdf" in allowed_mimes
    # DOCX (ZIP signature)
    if header[:4] == b"PK\x03\x04":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in allowed_mimes
    # Plain text — heuristic: first 512 bytes are printable
    sample = file_bytes[:512]
    if all(b < 128 for b in sample):
        return "text/plain" in allowed_mimes
    return False
