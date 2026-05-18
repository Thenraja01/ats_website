"""Resume upload and analysis controller."""

from fastapi import UploadFile
from pathlib import Path
from typing import Dict, Any
from app.services.resume_service import ResumeService
from app.services.scoring_service import ScoringService
from app.parsers.pdf_parser import PDFParser
from app.parsers.docx_parser import DocxParser
from app.parsers.text_cleaner import TextCleaner
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ResumeController:
    """Controller for resume-related operations."""

    def __init__(self):
        """Initialize controller."""
        self.resume_service = ResumeService()
        self.scoring_service = ScoringService()

    async def upload_and_analyze(
        self,
        file: UploadFile,
        name: str,
        email: str,
        job_description: str,
        job_id: int = 1,
    ) -> Dict[str, Any]:
        """Upload resume and perform ATS analysis."""
        try:
            # Save resume file
            file_content = await file.read()
            file_path = await self.resume_service.save_resume(file_content, file.filename)

            # Extract text from resume
            resume_text = self._extract_resume_text(str(file_path))

            # Clean text
            cleaner = TextCleaner()
            cleaned_text = cleaner.clean(resume_text)

            # Score resume
            scores, final_score = self.scoring_service.score_resume(cleaned_text, job_id)
            feedback = self.scoring_service.generate_feedback(final_score)

            logger.info(f"Successfully analyzed resume: {file.filename}")

            return {
                "success": True,
                "data": {
                    "id": str(hash(file.filename)),
                    "name": name,
                    "email": email,
                    "filename": file.filename,
                    "score": final_score,
                    "feedback": feedback,
                    "scores": scores,
                    "resume_text": cleaned_text[:500] + "..." if len(cleaned_text) > 500 else cleaned_text,
                },
            }
        except Exception as e:
            logger.error(f"Error in upload_and_analyze: {str(e)}")
            raise

    def _extract_resume_text(self, file_path: str) -> str:
        """Extract text from resume based on file type."""
        file_ext = Path(file_path).suffix.lower()

        if file_ext == ".pdf":
            return PDFParser.extract_text(file_path)
        elif file_ext == ".docx":
            return DocxParser.extract_text(file_path)
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
