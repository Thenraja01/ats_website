"""ATS service — high-performance unified LLM ATS scoring pipeline."""

import json
import re
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_llm():
    """Get the Groq LLM instance."""
    return ChatGroq(
        model_name="llama-3.3-70b-versatile",
        api_key=settings.GROQ_API_KEY,
        temperature=0.1,
    )


def _clean_json_output(raw_text: str) -> dict:
    """Safely extract and parse JSON from LLM output, handling markdown codeblocks."""
    clean = raw_text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean, re.DOTALL)
    if match:
        clean = match.group(1)
    else:
        # Fallback: look for outer braces
        start = clean.find("{")
        end = clean.rfind("}")
        if start != -1 and end != -1:
            clean = clean[start : end + 1]

    return json.loads(clean)


def _fallback_ats_pipeline(resume_text: str, jd_text: str) -> dict:
    """Heuristic fallback if LLM call fails."""
    logger.warning("Using heuristic fallback for ATS analysis")
    words_resume = set(re.findall(r"\b\w{3,}\b", resume_text.lower()))
    words_jd = set(re.findall(r"\b\w{3,}\b", jd_text.lower()))
    
    matched = list(words_resume.intersection(words_jd))[:10]
    missing = list(words_jd.difference(words_resume))[:5]
    
    score = min(95, max(30, int((len(matched) / (len(words_jd) or 1)) * 100 * 1.5)))
    
    return {
        "ats_score": score,
        "eligible": score >= 75,
        "missing_skills": missing,
        "suggestions": [
            "Highlight core project accomplishments with measurable metrics",
            "Tailor your skill keywords to closely align with the target job description",
            "Include technical certifications relevant to the desired role"
        ],
        "interview_questions": [
            "Can you walk us through a challenging project listed on your resume?",
            "How do you handle technical debt and code quality in production?",
            "Describe your experience collaborating with cross-functional product teams."
        ],
        "extracted_skills": matched[:12],
    }


def run_ats_pipeline(resume_text: str, jd_text: str) -> dict:
    """Run the consolidated ATS analysis pipeline in a single structured LLM call."""
    logger.info("Starting consolidated ATS pipeline")

    if not settings.GROQ_API_KEY:
        return _fallback_ats_pipeline(resume_text, jd_text)

    prompt = PromptTemplate.from_template(
        "You are an expert ATS (Applicant Tracking System) Evaluation Engine.\n"
        "Analyze the candidate's Resume against the Job Description.\n\n"
        "Resume:\n{resume}\n\n"
        "Job Description:\n{jd}\n\n"
        "Return a STRICT JSON object (no other text) with the following structure:\n"
        "{{\n"
        '  "extracted_skills": ["list of skills found in candidate resume"],\n'
        '  "missing_skills": ["required or preferred skills from JD not found in resume"],\n'
        '  "ats_score": 85,\n'
        '  "eligible": true,\n'
        '  "suggestions": [\n'
        '    "Actionable suggestion 1",\n'
        '    "Actionable suggestion 2",\n'
        '    "Actionable suggestion 3"\n'
        '  ],\n'
        '  "interview_questions": [\n'
        '    "Technical interview question 1",\n'
        '    "Technical interview question 2",\n'
        '    "Technical interview question 3"\n'
        '  ]\n'
        "}}\n"
    )

    from app.utils.anonymizer import anonymize_text
    safe_resume_text = anonymize_text(resume_text)

    try:
        llm = get_llm()
        chain = prompt | llm
        response = chain.invoke({"resume": safe_resume_text[:6000], "jd": jd_text[:4000]})
        parsed = _clean_json_output(response.content)

        ats_score = int(parsed.get("ats_score", 60))
        ats_score = max(0, min(100, ats_score))
        eligible = parsed.get("eligible", ats_score >= 75)

        return {
            "ats_score": ats_score,
            "eligible": bool(eligible),
            "missing_skills": [str(s) for s in parsed.get("missing_skills", []) if str(s).strip()],
            "suggestions": [str(s) for s in parsed.get("suggestions", []) if str(s).strip()],
            "interview_questions": [str(q) for q in parsed.get("interview_questions", []) if str(q).strip()],
            "extracted_skills": [str(s) for s in parsed.get("extracted_skills", []) if str(s).strip()],
        }
    except Exception as e:
        logger.error(f"ATS LLM pipeline error: {e}")
        return _fallback_ats_pipeline(resume_text, jd_text)

