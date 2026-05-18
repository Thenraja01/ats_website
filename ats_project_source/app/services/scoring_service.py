"""ATS scoring service."""

import os
import pandas as pd
import numpy as np
from typing import Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ScoringService:
    """Score resume against job descriptions using TF-IDF similarity."""

    def __init__(self):
        """Initialize scoring service."""
        self.jobs_df = self._load_jobs_csv()
        self.vectorizer = TfidfVectorizer(stop_words="english")

    def _load_jobs_csv(self) -> pd.DataFrame:
        """Load job descriptions CSV."""
        try:
            if not settings.JOBS_CSV_PATH.exists():
                raise FileNotFoundError(f"Jobs CSV not found: {settings.JOBS_CSV_PATH}")
            df = pd.read_csv(settings.JOBS_CSV_PATH).fillna("")
            logger.info(f"Loaded {len(df)} job descriptions from CSV")
            return df
        except Exception as e:
            logger.error(f"Error loading jobs CSV: {str(e)}")
            raise

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate TF-IDF cosine similarity between two texts."""
        if not text1 or not text2:
            return 0.0
        try:
            tfidf = self.vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(similarity * 100)
        except Exception as e:
            logger.error(f"Error calculating similarity: {str(e)}")
            return 0.0

    def score_resume(self, resume_text: str, job_id: int = 1) -> Tuple[Dict[str, float], float]:
        """Score resume against job requirements."""
        try:
            job_df = self.jobs_df[self.jobs_df["JobID"] == job_id]
            if job_df.empty:
                logger.warning(f"Job ID {job_id} not found")
                job_id = 1
                job_df = self.jobs_df[self.jobs_df["JobID"] == job_id]

            job = job_df.iloc[0]

            scores = {
                "Skills Match": self._calculate_similarity(resume_text, str(job.get("Skills", ""))),
                "Experience Match": self._calculate_similarity(resume_text, str(job.get("Experience", ""))),
                "Internship Match": self._calculate_similarity(resume_text, str(job.get("Internships", ""))),
                "Certificates Match": self._calculate_similarity(resume_text, str(job.get("Certificates", ""))),
                "Projects Match": self._calculate_similarity(resume_text, str(job.get("Projects", ""))),
                "Education Match": self._calculate_similarity(resume_text, str(job.get("Education", ""))),
            }

            # Round all scores
            scores = {k: round(v, 2) for k, v in scores.items()}
            
            # Calculate final score
            final_score = round(float(np.mean(list(scores.values()))), 2)

            logger.info(f"Scored resume against job {job_id}: {final_score}")
            return scores, final_score
        except Exception as e:
            logger.error(f"Error scoring resume: {str(e)}")
            raise

    def generate_feedback(self, score: float) -> str:
        """Generate feedback based on score."""
        if score >= 90:
            return "Excellent! Your resume is well-optimized for ATS systems."
        elif score >= 75:
            return "Good job! Minor improvements could boost your score further."
        elif score >= 60:
            return "Your resume needs some improvements. Consider adding more relevant keywords."
        else:
            return "Significant improvements needed. Please review the job description carefully."
