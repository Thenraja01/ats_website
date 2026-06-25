"""Input validators."""

from typing import List


def validate_email(email: str) -> bool:
    """Validate email format."""
    import re

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None


def validate_file_extension(filename: str, allowed: List[str]) -> bool:
    """Validate file extension."""
    from pathlib import Path

    ext = Path(filename).suffix.lower()
    return ext in allowed


def validate_file_size(size: int, max_size: int) -> bool:
    """Validate file size."""
    return size <= max_size


def validate_password(password: str) -> bool:
    """Validate password strength."""
    if len(password) < 8:
        return False
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    return has_upper and has_lower and has_digit
