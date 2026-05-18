"""ATS scoring controller."""

from typing import Dict, Any
from app.services.scoring_service import ScoringService
from app.parsers.text_cleaner import TextCleaner
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ATSController:
    """Controller for ATS scoring operations."""

    def __init__(self):
        """Initialize controller."""
        self.scoring_service = ScoringService()
        self.cleaner = TextCleaner()

    def analyze_resume(
        self,
        resume_text: str,
        job_description: str,
        job_id: int = 1,
    ) -> Dict[str, Any]:
        """Analyze resume against job description."""
        try:
            # Clean texts
            cleaned_resume = self.cleaner.clean(resume_text)
            cleaned_jd = self.cleaner.clean(job_description)

            # Score resume
            scores, final_score = self.scoring_service.score_resume(cleaned_resume, job_id)
            feedback = self.scoring_service.generate_feedback(final_score)

            logger.info(f"Successfully analyzed resume with final score: {final_score}")

            return {
                "success": True,
                "data": {
                    "final_score": final_score,
                    "feedback": feedback,
                    "scores": scores,
                    "suggestions": self._generate_suggestions(scores),
                },
            }
        except Exception as e:
            logger.error(f"Error in analyze_resume: {str(e)}")
            raise

    def _generate_suggestions(self, scores: Dict[str, float]) -> list:
        """Generate suggestions based on scores."""
        suggestions = []
        for category, score in scores.items():
            if score < 60:
                suggestions.append(f"Improve {category.lower()} section in your resume")
        return suggestions
