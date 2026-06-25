"""Helper functions."""

import re
from typing import List


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    if not text:
        return ""
    # Remove special characters
    text = re.sub(r"[^\w\s\.\-\+/#]", " ", text, flags=re.UNICODE)
    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


def extract_keywords(text: str, keywords: List[str]) -> List[str]:
    """Extract keywords from text."""
    text = text.lower()
    found_keywords = []
    for keyword in keywords:
        if keyword.lower() in text:
            found_keywords.append(keyword)
    return list(set(found_keywords))


def truncate_text(text: str, max_length: int = 500) -> str:
    """Truncate text to maximum length."""
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text


def calculate_percentage(numerator: float, denominator: float) -> float:
    """Calculate percentage safely."""
    if denominator == 0:
        return 0.0
    return round((numerator / denominator) * 100, 2)
