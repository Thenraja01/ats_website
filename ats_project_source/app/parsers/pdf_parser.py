"""PDF document parser using pdfplumber."""

import pdfplumber
from pathlib import Path
from typing import Optional, List, Dict
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PDFParser:
    """Parser for extracting text from PDF files using pdfplumber."""

    @staticmethod
    def extract_text(file_path: str) -> Optional[str]:
        """Extract text from PDF file using pdfplumber."""
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        logger.debug(f"Extracted text from PDF page {page_num + 1}")
                        text += page_text + " "
            logger.info(f"Successfully extracted text from PDF: {file_path}")
            return text.strip().lower() if text.strip() else None
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            raise RuntimeError(f"Failed to extract PDF text: {str(e)}")

    @staticmethod
    def extract_structured_data(file_path: str) -> Dict[str, any]:
        """Extract structured data including tables from PDF."""
        try:
            structured_data = {
                "text": "",
                "tables": [],
                "metadata": {}
            }
            with pdfplumber.open(file_path) as pdf:
                structured_data["metadata"] = pdf.metadata or {}
                for page_num, page in enumerate(pdf.pages):
                    # Extract text
                    text = page.extract_text()
                    if text:
                        structured_data["text"] += text + " "
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        structured_data["tables"].extend(tables)
            logger.info(f"Successfully extracted structured data from PDF: {file_path}")
            return structured_data
        except Exception as e:
            logger.error(f"Error extracting PDF structured data: {str(e)}")
            raise RuntimeError(f"Failed to extract PDF data: {str(e)}")
