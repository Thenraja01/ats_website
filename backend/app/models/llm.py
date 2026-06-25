from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from app.core.config import settings
import json

# Master LLM initialization
def get_llm():
    return ChatGroq(model_name="llama-3.3-70b-versatile", api_key=settings.GROQ_API_KEY)

# Resume Agent
def analyze_resume_agent(resume_text: str):
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

# JD Analyzer
def analyze_jd_agent(jd_text: str):
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are an expert Job Description Analyzer.\n"
        "Extract the core required skills and key responsibilities from this JD.\n"
        "JD:\n{jd}\n\n"
        "Return the output strictly in JSON format with keys: required_skills, responsibilities."
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({"jd": jd_text})

# ATS Agent
def calculate_ats_score_agent(resume_data: dict, jd_data: dict):
    llm = get_llm()
    prompt = PromptTemplate.from_template(
        "You are an ATS Scoring Engine.\n"
        "Compare the candidate's resume data with the JD requirements.\n"
        "Calculate a score out of 100 based on:\n"
        "Skill Match (50%), Experience (25%), Projects (15%), Education (10%).\n"
        "Resume Data: {resume}\n"
        "JD Data: {jd}\n\n"
        "Return the output strictly in JSON format with keys: ats_score (integer), eligible (boolean, true if >= 75), missing_skills (list)."
    )
    chain = prompt | llm | JsonOutputParser()
    return chain.invoke({
        "resume": json.dumps(resume_data),
        "jd": json.dumps(jd_data)
    })

# Suggestion Agent
def generate_suggestions_agent(missing_skills: list):
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

# Interview Agent
def generate_interview_questions_agent(jd_data: dict, missing_skills: list):
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
        "skills": ", ".join(missing_skills)
    })
    return result.content
