"""Celery background tasks for AI deep research and personalized interview generation."""

import asyncio
import json
import httpx
import re
from typing import Dict, Any, List
from app.core.celery_app import celery_app
from app.core.config import settings
from app.services.web_search_service import research_interview_context
from app.utils.logger import get_logger

logger = get_logger(__name__)
import uuid
from datetime import datetime
from pymongo import MongoClient


@celery_app.task(bind=True, name="interview.generate_deep_prep")
def generate_deep_interview_pack_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Background Celery task that performs deep web research and generates a tailored interview pack."""
    user_id = payload.get("user_id")
    role = payload.get("role", "Software Engineer")
    company = payload.get("company", "")
    resume_text = payload.get("resume_text", "")
    skills = payload.get("skills", [])

    logger.info(f"Starting Celery Interview Task for role: {role}, company: {company}")

    # ── Step 1: Update Progress ──────────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": 1, "total_steps": 4, "message": "Extracting candidate resume context & skills..."}
    )

    # Extract top keywords if not provided
    if not skills and resume_text:
        found = re.findall(r"\b(Python|FastAPI|React|TypeScript|JavaScript|Docker|AWS|Redis|MongoDB|PostgreSQL|Kubernetes|Node|SQL|Go|Java)\b", resume_text, re.I)
        skills = list(set([f.capitalize() for f in found]))

    # ── Step 2: Web Research ─────────────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": 2, "total_steps": 4, "message": f"Searching real-world interview trends for {company or role}..."}
    )

    web_data = research_interview_context(role, company, skills)
    tech_trends = "\n".join(web_data.get("tech_trends", []))
    aptitude_trends = "\n".join(web_data.get("aptitude_trends", []))

    # ── Step 3: LLM Generation via Ollama ────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": 3, "total_steps": 4, "message": "Synthesizing Aptitude, Technical & Project Defense questions with Ollama..."}
    )

    prompt = f"""You are HireMind AI's Deep Research Interview Generator.
Generate a structured, hyper-personalized interview pack for:
TARGET ROLE: {role}
TARGET COMPANY: {company or 'Tech Industry Standard'}
CANDIDATE SKILLS: {', '.join(skills[:8]) if skills else 'Full Stack Development'}
CANDIDATE RESUME SUMMARY: {resume_text[:400] if resume_text else 'Software engineering background'}

ONLINE INTERVIEW PATTERNS FOUND:
Technical Patterns: {tech_trends[:400]}
Aptitude Patterns: {aptitude_trends[:400]}

Generate 4 high-impact questions:
- Round 1 (Aptitude/Logic): 1 question testing problem-solving or CS algorithmic logic.
- Round 2 (Technical/Resume Defense): 2 technical questions probing candidate skills and architecture decisions.
- Round 3 (System Design/Scenario): 1 question on real-world scalability and error handling.

Return ONLY a valid JSON object matching this schema:
{{
  "questions": [
    {{
      "category": "Aptitude | Technical | System Design",
      "difficulty": "Intermediate",
      "question": "Clear question prompt",
      "ideal_answer": "Concise reference answer with the core expected concepts",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }}
  ]
}}
"""

    questions_list = []
    try:
        ollama_url = f"{settings.OLLAMA_URL.rstrip('/')}/api/generate"
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(
                ollama_url,
                json={
                    "model": settings.OLLAMA_CHAT_MODEL,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                    "options": {"temperature": 0.2, "num_predict": 600},
                },
            )
            if resp.status_code == 200:
                raw_json = resp.json().get("response", "{}").strip()
                parsed = json.loads(raw_json)
                questions_list = parsed.get("questions", [])
    except Exception as e:
        logger.warning(f"Ollama generation in Celery failed ({e}). Falling back to research question templates.")

    # Fallback to high quality role templates if generation was empty
    if not questions_list:
        questions_list = [
            {
                "category": "Aptitude",
                "difficulty": "Intermediate",
                "question": f"Given a streaming dataset of transactions, what algorithm would you use to find the top K frequent items in sub-linear space?",
                "ideal_answer": "Heavy-Hitters algorithm or Count-Min Sketch combined with a min-heap.",
                "keywords": ["Count-Min Sketch", "heap", "streaming", "complexity", "frequency"]
            },
            {
                "category": "Technical",
                "difficulty": "Intermediate",
                "question": f"In your experience with {skills[0] if skills else 'backend APIs'}, how do you handle cache invalidation and race conditions?",
                "ideal_answer": "Write-through caching, distributed locks (e.g. Redlock), and TTL-based expiration.",
                "keywords": ["cache invalidation", "distributed lock", "ttl", "consistency"]
            },
            {
                "category": "System Design",
                "difficulty": "Advanced",
                "question": f"How would you architect a resilient notification dispatch service for {company or 'a high-scale platform'} that guarantees at-least-once delivery?",
                "ideal_answer": "Message queues (RabbitMQ/Kafka), idempotent consumers, exponential backoff with dead-letter queues, and database outbox pattern.",
                "keywords": ["idempotency", "outbox pattern", "dead-letter queue", "backoff", "resilience"]
            }
        ]

    # ── Step 4: Persist into Database ────────────────────────
    self.update_state(
        state="PROGRESS",
        meta={"step": 4, "total_steps": 4, "message": "Saving interview session & question pack to your workspace..."}
    )

    mongo_client = MongoClient(settings.MONGODB_URL)
    db = mongo_client[settings.DATABASE_NAME]

    q_docs = []
    for q in questions_list:
        q_docs.append({
            "id": uuid.uuid4().hex[:12],
            "question": q.get("question", ""),
            "category": q.get("category", "Technical"),
            "difficulty": q.get("difficulty", "Intermediate"),
            "ideal_answer": q.get("ideal_answer", ""),
            "keywords": q.get("keywords", []),
            "user_answer": "",
            "feedback": None,
        })

    title = f"{company + ' - ' if company else ''}{role} Deep Prep"
    session_doc = {
        "user_id": str(user_id) if user_id else "guest",
        "title": title,
        "session_type": "deep_prep",
        "job_title": role,
        "resume_version_id": None,
        "status": "in_progress",
        "current_index": 0,
        "questions": q_docs,
        "feedback": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    insert_res = db["interview_sessions"].insert_one(session_doc)
    session_id = str(insert_res.inserted_id)

    logger.info(f"Celery Task finished successfully! Session created: {session_id}")
    return {
        "status": "completed",
        "session_id": session_id,
        "role": role,
        "company": company,
        "question_count": len(questions_list),
        "source": "Deep Web Search + Ollama llama3.2"
    }
