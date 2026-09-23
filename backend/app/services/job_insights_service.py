"""JD Insights service — deterministic, evidence-based analysis of a job description.

These functions compute real structure from the job description text (no LLM, no mock).
An optional LLM upgrade can be layered on later without changing the API shape.
"""

import re
from typing import List, Tuple


SKILL_LEXICON = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", ".net", "go", "golang", "rust",
    "ruby", "php", "kotlin", "swift", "scala", "dart", "c", "sql", "shell", "bash", "powershell",
    "grep", "awk",
    # Web / frontend
    "react", "next.js", "angular", "vue", "svelte", "redux", "html", "css", "tailwind",
    "webpack", "vite", "graphql", "rest", "restful", "http", "websocket", "sass", "bootstrap",
    "storybook", "mobx", "zustand", "jquery",
    # Backend / frameworks
    "node", "node.js", "express", "fastapi", "django", "flask", "spring", "spring boot", "laravel",
    "rails", "asp.net", "fastify", "nestjs", "ruby on rails", "graphql",
    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "dynamodb", "cassandra", "neo4j", "clickhouse", "mariadb", "oracle", "sql server", "prisma",
    "kafka", "rabbitmq", "airflow", "etl",
    # Cloud / DevOps / Infra
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform",
    "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd", "nginx", "linux", "serverless",
    "lambda", "s3", "ec2", "vercel", "netlify", "cloudflare", "helm", "prometheus", "grafana",
    # AI / ML / Data
    "machine learning", "deep learning", "nlp", "rag", "llm", "chatgpt", "langchain",
    "embeddings", "vector database", "chroma", "pandas", "numpy", "scikit-learn", "tensorflow",
    "pytorch", "opencv", "hugging face", "genai", "generative ai", "fine-tuning", "data analysis",
    "a/b testing", "statistics", "pyspark", "spark",
    # Testing / quality
    "jest", "cypress", "playwright", "pytest", "junit", "selenium", "unit testing", "mocha",
    "eslint", "testing library", "tdd",
    # Tools / practices
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack", "figma", "agile",
    "scrum", "kanban", "storybook", "microservices", "monolith", "soa", "observability",
    "logging", "monitoring", "performance", "security", "authentication", "authorization",
    "oauth", "jwt", "api", "microservice",
    # Soft / methodology
    "leadership", "mentorship", "communication", "collaboration", "problem-solving",
    "code review", "documentation",
]

SKILL_ALIASES = {
    "k8s": "kubernetes",
    "golang": "go",
    "restful": "rest",
    "react.js": "react",
    "node": "node.js",
    "postgres": "postgresql",
    "ai": "AI",
}

ACTION_VERBS = [
    "design", "develop", "build", "lead", "manage", "implement", "create", "maintain",
    "collaborate", "own", "drive", "improve", "optimize", "architect", "write", "ship",
    "mentor", "review", "integrate", "deploy", "automate", "analyze", "coordinate",
    "ensure", "support", "troubleshoot", "test", "refactor", "monitor", "scale",
]

PREFERRED_INDICATORS = re.compile(
    r"\b(nice to have|preferred|bonus|good to have|plus|would be a plus|beneficial)\b",
    re.IGNORECASE,
)
MUST_INDICATORS = re.compile(
    r"\b(must have|required|requirements|you have|you will bring|we need|essential|you'll bring)\b",
    re.IGNORECASE,
)


def _normalize(text: str) -> str:
    return re.sub(r"[\r\n\t]+", " ", text.lower())


def _find_skills(text: str) -> List[str]:
    normalized = _normalize(text)
    found = []
    for skill in SKILL_LEXICON:
        escaped = re.escape(skill)
        pattern = rf"(?:\b|_){escaped}(?:\b|_)" if re.match(r"^\w", skill) and re.match(r"\w$", skill) else rf"{escaped}"
        if re.search(pattern, normalized):
            found.append(SKILL_ALIASES.get(skill, skill))
    seen = set()
    ordered = []
    for s in found:
        if s not in seen:
            seen.add(s)
            ordered.append(s)
    return ordered


def _split_bullets(text: str) -> List[str]:
    bullets = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        clean = re.sub(r"^[-*•▪◦◦01.)]\s*", "", stripped).strip()
        if clean and len(clean) > 3:
            bullets.append(clean)
    return bullets


def _section_lines(text: str, header_pattern: re.Pattern) -> List[str]:
    """Collect bullet/numbered lines that fall under a matched section header."""
    lines = _split_bullets(text)
    result = []
    active = False
    for line in lines:
        low = line.lower()
        if header_pattern.search(low):
            active = True
            continue
        if active:
            if re.match(r"^[A-Z][A-Z\s]{2,}", low) or len(low) < 4:
                continue
            result.append(line)
    return result


def analyze_jd(jd_text: str) -> dict:
    """Extract structured insights from a raw job description."""
    if not jd_text or not jd_text.strip():
        return {
            "role": "", "experience": "", "location": "", "employmentType": "",
            "requiredSkills": [], "preferredSkills": [], "responsibilities": [],
            "qualifications": [], "keywords": [], "summary": "",
        }

    normalized = _normalize(jd_text)

    # Experience expectation
    exp_match = re.search(r"(\d+)\+?\s*(?:years?|yrs)", normalized)
    experience = f"{exp_match.group(1)}+ years" if exp_match else ""
    exp_advanced = re.search(r"minimum of\s*(\d+)\s*(?:years?|yrs)", normalized)
    if exp_advanced and not experience:
        experience = f"{exp_advanced.group(1)}+ years"

    # Location & employment type
    location = "Remote"
    for tag, label in [
        ("hybrid", "Hybrid"), ("on-site", "On-site"), ("onsite", "On-site"),
        ("remote", "Remote"), ("in-office", "On-site"),
    ]:
        if rf"\b{tag}\b" in normalized:
            location = label
            break

    employment_type = "Full-time"
    for tag, label in [
        ("full-time", "Full-time"), ("full time", "Full-time"),
        ("part-time", "Part-time"), ("part time", "Part-time"),
        ("contract", "Contract"), ("internship", "Internship"),
        ("freelance", "Freelance"),
    ]:
        if f" {tag} " in f" {normalized} ":
            employment_type = label
            break

    # Role inference
    role = ""
    role_candidates = [
        "frontend developer", "backend developer", "full stack developer", "full-stack developer",
        "software engineer", "devops engineer", "data scientist", "machine learning engineer",
        "data engineer", "ai engineer", "react developer", "product designer", "ux designer",
        "qa engineer", "site reliability engineer", "security engineer", "mobile developer",
        "team lead", "engineering manager", "project manager", "product manager",
        "intern", "graduate",
    ]
    for candidate in role_candidates:
        if candidate in normalized:
            role = candidate.title()
            break

    # Skill classification
    required_section = _section_lines(jd_text, re.compile(r"(requirements|qualifications|you (will|'ll) (bring|need|have)|must (have|be)|what you)"))

    all_skills = _find_skills(jd_text)
    required_skills, preferred_skills = [], []
    scored = {}
    sentences = re.split(r"(?<=[.!?])\s+|\n+", normalized)
    for skill in all_skills:
        raw_names = [skill]
        for raw, canon in SKILL_ALIASES.items():
            if canon == skill and raw not in raw_names:
                raw_names.append(raw)
        requires_vote = 0
        for sentence in sentences:
            if not any(name in sentence for name in raw_names):
                continue
            if MUST_INDICATORS.search(sentence):
                requires_vote += 1
            if PREFERRED_INDICATORS.search(sentence):
                requires_vote -= 1
        section_hint = any(skill in _normalize(ln) for ln in required_section)
        if section_hint:
            requires_vote += 1
        # Boost skills mentioned multiple times
        count = sum(normalized.count(name) for name in raw_names)
        requires_vote += 1 if count >= 2 else 0
        scored[skill] = requires_vote

    for skill, vote in scored.items():
        if vote >= 1:
            required_skills.append(skill)
        else:
            preferred_skills.append(skill)

    # Responsibilities: bullets with action verbs, or under a header
    responsibilities = []
    resp_lines = _section_lines(
        jd_text,
        re.compile(r"(responsibilit|what you('| wi)?ll do|your role|about the role|job duties|key duties|day to day)"),
    ) or [ln for ln in _split_bullets(jd_text) if any(v in _normalize(ln)[:3] for v in ACTION_VERBS)]
    for ln in resp_lines[:14]:
        if ln not in responsibilities:
            responsibilities.append(ln)

    # Qualifications lines
    qualifications = [
        ln
        for ln in _section_lines(jd_text, re.compile(r"(qualifications?|requirements|you (will|'ll) (bring|need|have)|education)"))
        if ln not in qualifications
    ][:10]

    keywords = all_skills[:24]

    summary = " ".join(_split_bullets(jd_text)[:6])[:400]

    return {
        "role": role,
        "experience": experience,
        "location": location,
        "employmentType": employment_type,
        "requiredSkills": required_skills,
        "preferredSkills": preferred_skills,
        "responsibilities": responsibilities,
        "qualifications": qualifications,
        "keywords": keywords,
        "summary": summary,
    }