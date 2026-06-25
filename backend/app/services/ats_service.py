"""ATS service — orchestrates the LLM-based ATS scoring pipeline.

Uses Groq LLM via LangChain to:
1. Analyze resume → extract skills, education, experience, projects
2. Analyze job description → extract required skills, responsibilities
3. Calculate ATS score → compare resume vs JD
4. Generate suggestions → for missing skills
5. Generate interview questions → based on JD and gaps
"""

from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.core.config import settings
from app.utils.logger import get_logger
import json

logger = get_logger(__name__)


def get_llm():
    """Get the Groq LLM instance."""
    return ChatGroq(
        model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY
    )


def analyze_resume_agent(resume_text: str) -> dict:
    """Extract structured data from resume text."""
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are an expert ATS Resume Analyzer.\n"
        "Extract the following details from the resume:\n"
        "- skills (list of strings)\n"
        "- education (list of strings)\n"
        "- experience (list of strings)\n"
        "- projects (list of strings)\n\n"
        "Resume:\n{resume}\n\n"
        "Return the output strictly in JSON format."
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({"resume": resume_text})


def analyze_jd_agent(jd_text: str) -> dict:
    """Extract requirements from a job description."""
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are an expert Job Description Analyzer.\n"
        "Extract the core required skills and key responsibilities from this JD.\n"
        "JD:\n{jd}\n\n"
        "Return the output strictly in JSON format with keys: required_skills, responsibilities."
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({"jd": jd_text})


def calculate_ats_score_agent(resume_data: dict, jd_data: dict) -> dict:
    """Calculate ATS score by comparing resume data against JD requirements."""
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are an ATS Scoring Engine.\n"
        "Compare the candidate's resume data with the JD requirements.\n"
        "Calculate a score out of 100 based on:\n"
        "Skill Match (50%), Experience (25%), Projects (15%), Education (10%).\n"
        "Resume Data: {resume}\n"
        "JD Data: {jd}\n\n"
        "Return the output strictly in JSON format with keys: "
        "ats_score (integer), eligible (boolean, true if >= 75), missing_skills (list)."
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({
        "resume": json.dumps(resume_data),
        "jd": json.dumps(jd_data),
    })


def generate_suggestions_agent(missing_skills: list) -> str:
    """Generate career improvement suggestions for missing skills."""
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are a Career Coach.\n"
        "The candidate is missing these skills: {skills}.\n"
        "Provide 3-5 actionable suggestions to improve their resume and acquire these skills.\n"
        "Return as a list of strings."
    )
    chain = prompt | llm
    result = chain.invoke({"skills": ", ".join(missing_skills)})
    return result.content


def generate_interview_questions_agent(jd_data: dict, missing_skills: list) -> str:
    """Generate tailored interview questions based on JD and skill gaps."""
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are a Technical Interviewer.\n"
        "Based on the JD: {jd} and the candidate's missing skills: {skills},\n"
        "generate 5 tailored interview questions to test their adaptability and core competencies.\n"
        "Return as a list of strings."
    )
    chain = prompt | llm
    result = chain.invoke({
        "jd": json.dumps(jd_data),
        "skills": ", ".join(missing_skills),
    })
    return result.content


def run_ats_pipeline(resume_text: str, jd_text: str) -> dict:
    """Run the full ATS analysis pipeline.

    Steps: resume analysis → JD analysis → scoring → suggestions → interview Qs.
    """
    logger.info("Starting ATS pipeline")

    resume_data = analyze_resume_agent(resume_text)
    jd_data = analyze_jd_agent(jd_text)
    ats_result = calculate_ats_score_agent(resume_data, jd_data)

    missing_skills = ats_result.get("missing_skills", [])

    suggestions = []
    if missing_skills:
        suggestions_raw = generate_suggestions_agent(missing_skills)
        suggestions = [s.strip() for s in suggestions_raw.split("\n") if s.strip()]

    interview_qs_raw = generate_interview_questions_agent(jd_data, missing_skills)
    interview_qs = [q.strip() for q in interview_qs_raw.split("\n") if q.strip()]

    logger.info(f"ATS pipeline complete — score: {ats_result.get('ats_score', 0)}")

    return {
        "ats_score": ats_result.get("ats_score", 0),
        "eligible": ats_result.get("eligible", False),
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "interview_questions": interview_qs,
        "extracted_skills": resume_data.get("skills", []),
    }
