from app.models.llm import (
    analyze_resume_agent,
    analyze_jd_agent,
    calculate_ats_score_agent,
    generate_suggestions_agent,
    generate_interview_questions_agent
)

def run_ats_pipeline(resume_text: str, jd_text: str) -> dict:
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

    return {
        "ats_score": ats_result.get("ats_score", 0),
        "eligible": ats_result.get("eligible", False),
        "missing_skills": missing_skills,
        "suggestions": suggestions,
        "interview_questions": interview_qs,
        "extracted_skills": resume_data.get("skills", [])
    }
