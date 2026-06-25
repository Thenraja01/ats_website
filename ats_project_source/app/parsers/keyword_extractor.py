"""Keyword extractor from resume text."""

import re
from typing import List, Dict
from app.utils.logger import get_logger

logger = get_logger(__name__)


class KeywordExtractor:
    """Extract keywords and skills from resume text."""

    @staticmethod
    def extract_skills(text: str, skill_keywords: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Extract skills from text by category."""
        found_skills = {}
        
        for category, keywords in skill_keywords.items():
            found_skills[category] = []
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    found_skills[category].append(keyword)
        
        logger.debug(f"Extracted skills: {found_skills}")
        return found_skills

    @staticmethod
    def extract_emails(text: str) -> List[str]:
        """Extract email addresses from text."""
        pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        emails = re.findall(pattern, text)
        return list(set(emails))

    @staticmethod
    def extract_phones(text: str) -> List[str]:
        """Extract phone numbers from text."""
        pattern = r"\+?1?\d{9,15}"
        phones = re.findall(pattern, text)
        return list(set(phones))

    @staticmethod
    def extract_years_of_experience(text: str) -> int:
        """Estimate years of experience from text."""
        pattern = r"(\d+)\s*(?:years?|yrs?)[\s\w]*(?:experience|exp)"
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            return max([int(m) for m in matches])
        return 0
