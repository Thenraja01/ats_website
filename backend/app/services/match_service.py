"""Resume ↔ JD Matching service — deterministic, evidence-based match computation.

Produces a score plus per-requirement category breakdown (Matched / Partial / Missing /
Not Applicable) so the UI can render the JD Tailor three-pane view.
"""

import re
from typing import List, Tuple

from app.services.job_insights_service import SKILL_LEXICON, _find_skills


def _text_blob(*parts) -> str:
    return " ".join(str(p) for p in parts if p).lower()


def _count_occurrences(text: str, skill: str) -> int:
    escaped = re.escape(skill)
    pattern = rf"(?:\b|_){escaped}(?:\b|_)" if re.match(r"^\w", skill) and re.match(r"\w$", skill) else rf"{escaped}"
    return len(re.findall(pattern, text, re.IGNORECASE))


def _years_of_experience(text: str) -> float:
    matches = re.findall(r"(\d+(?:\.\d+)?)\s*(?:years?|yrs)", text, re.IGNORECASE)
    return max([float(m) for m in matches]) if matches else 0.0


def _normalized_skills(raw: List[str], resume_text: str = "", jd_text: str = "") -> List[str]:
    """Deduplicate an ordered skill list, keeping first occurrence."""
    seen, out = set(), []
    for s in raw:
        s = s.strip()
        low = s.lower()
        if low and low not in seen:
            seen.add(low)
            out.append(s)
    return out


def match_resume_jd(
    resume_text: str, jd_text: str, required_skills: List[str] | None = None, preferred_skills: List[str] | None = None
) -> dict:
    """Compute the match report between a resume and a job description."""
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    required = _normalized_skills(required_skills if required_skills is not None else _find_skills(jd_text))
    preferred = _normalized_skills(preferred_skills if preferred_skills is not None else [])

    resume_hits = {s: _count_occurrences(resume_lower, s) for s in required}
    pref_hits = {s: _count_occurrences(resume_lower, s) for s in preferred}

    matched, partial, missing = [], [], []
    for skill in required:
        hits = resume_hits.get(skill, 0)
        if hits >= 2:
            matched.append({"skill": skill, "status": "matched", "occurrences": hits, "evidence": True})
        elif hits == 1:
            partial.append({"skill": skill, "status": "partial", "occurrences": hits, "evidence": True})
        else:
            missing.append({"skill": skill, "status": "missing", "occurrences": 0, "evidence": False})

    not_applicable = []
    for skill in preferred:
        hits = pref_hits.get(skill, 0)
        if hits == 0:
            not_applicable.append({"skill": skill, "status": "not_applicable", "occurrences": 0, "evidence": False})
        elif hits >= 2:
            matched.append({"skill": skill, "status": "matched", "occurrences": hits, "evidence": True})
        else:
            partial.append({"skill": skill, "status": "partial", "occurrences": hits, "evidence": True})

    total = len(required) + len(preferred)
    matched_count = len(matched)
    partial_count = len(partial)
    missing_count = len(missing)
    na_count = len(not_applicable)

    # Skill coverage: matched weighted 1.0, partial 0.5
    skill_score = (matched_count + 0.5 * partial_count) / max(total, 1) * 100

    # Keyword overlap of the full JD vocabulary
    def tokens(t: str) -> set:
        return {w for w in re.findall(r"\b[a-z][a-z0-9+#.]{2,}\b", t.lower()) if w not in _STOPWORDS}

    jd_tokens = tokens(jd_text)
    resume_tokens = tokens(resume_text)
    overlap = len(jd_tokens & resume_tokens) / max(len(jd_tokens), 1) * 100

    # Experience alignment
    resume_years = _years_of_experience(resume_text)
    jd_match = re.search(r"(\d+)\+?\s*(?:years?|yrs)", jd_lower)
    jd_years = float(jd_match.group(1)) if jd_match else 0.0
    experience_note = ""
    if jd_years:
        if resume_years >= jd_years:
            experience_score = 100
            experience_note = f"Exceeds or meets the {int(jd_years)}-year requirement ({resume_years:g} years found)."
        elif resume_years > 0:
            experience_score = round((resume_years / jd_years) * 100)
            experience_note = f"Below the {int(jd_years)}-year requirement ({resume_years:g} years found)."
        else:
            experience_score = 40
            experience_note = "No explicit years-of-experience found in the resume."
    else:
        experience_score = 100
        experience_note = "No explicit experience requirement in the JD."

    overall = round(0.55 * skill_score + 0.2 * overlap + 0.25 * experience_score)
    overall = max(0, min(100, overall))

    return {
        "overall": overall,
        "skillScore": round(skill_score),
        "keywordMatch": round(overlap),
        "experienceScore": round(experience_score),
        "experienceNote": experience_note,
        "matched": matched,
        "partial": partial,
        "missing": missing,
        "notApplicable": not_applicable,
        "matchedCount": matched_count,
        "partialCount": partial_count,
        "missingCount": missing_count,
        "notApplicableCount": na_count,
        "requiredSkills": required,
        "preferredSkills": preferred,
        "resumeYears": resume_years,
        "jdYears": jd_years,
    }


_STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "you", "your", "our", "are", "will", "have",
    "has", "from", "they", "them", "their", "not", "but", "all", "can", "out", "who", "what",
    "when", "where", "which", "into", "about", "than", "then", "these", "those", "only",
    "just", "also", "here", "there", "should", "could", "would", "job", "role", "team",
    "experience", "minimum", "years", "plus", "nice", "good", "work", "working", "responsibilities",
}