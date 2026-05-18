"""DOCX document parser."""

import docx2txt
from typing import Optional
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DocxParser:
    """Parser for extracting text from DOCX files."""

    @staticmethod
    def extract_text(file_path: str) -> Optional[str]:
        """Extract text from DOCX file."""
        try:
            text = docx2txt.process(file_path)
            logger.info(f"Successfully extracted text from DOCX: {file_path}")
            return text.strip().lower()
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {str(e)}")
            raise RuntimeError(f"Failed to extract DOCX text: {str(e)}")
