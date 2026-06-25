"""Text content cleaner."""

import re
from typing import List
from app.utils.logger import get_logger

logger = get_logger(__name__)


class TextCleaner:
    """Clean and normalize resume text."""

    @staticmethod
    def clean(text: str) -> str:
        """Clean text by removing special characters and normalizing spaces."""
        if not text:
            return ""

        # Remove null characters
        text = text.replace("\x00", " ")

        # Remove special characters but keep common ones
        text = re.sub(r"[^\w\s\.\-\+/#@()]", " ", text, flags=re.UNICODE)

        # Normalize whitespace
        text = re.sub(r"\s+", " ", text)

        # Convert to lowercase
        text = text.lower().strip()

        logger.debug("Text cleaned successfully")
        return text

    @staticmethod
    def extract_sentences(text: str) -> List[str]:
        """Extract sentences from text."""
        sentences = re.split(r"[.!?]\s+", text)
        return [s.strip() for s in sentences if s.strip()]

    @staticmethod
    def extract_paragraphs(text: str) -> List[str]:
        """Extract paragraphs from text."""
        paragraphs = text.split("\n\n")
        return [p.strip() for p in paragraphs if p.strip()]
