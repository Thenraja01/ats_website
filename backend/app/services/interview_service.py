"""Interview service — seedable question bank, project-based question generation,
and deterministic, evidence-based answer feedback."""

import re

CATEGORIES = [
    "Frontend", "Backend", "Database", "AI/ML", "RAG", "DevOps",
    "System Design", "Behavioral", "HR", "Project",
]
DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

# Curated question bank. Persisted into Mongo on first access so users can customize.
QUESTION_BANK: list[dict] = [
    # Frontend
    {"category": "Frontend", "difficulty": "Beginner", "question": "What is the difference between == and === in JavaScript?",
     "ideal_answer": "== performs loose equality with type coercion, while === compares value and type strictly.",
     "keywords": ["strict equality", "type coercion", "loose equality", "primitive", "reference"]},
    {"category": "Frontend", "difficulty": "Intermediate", "question": "Explain how React's virtual DOM improves performance.",
     "ideal_answer": "React diffing in memory, batched updates, minimal real DOM mutations, reconciliation.",
     "keywords": ["virtual dom", "reconciliation", "diffing", "batching", "paint", "re-render"]},
    {"category": "Frontend", "difficulty": "Intermediate", "question": "What are React hooks and what problem do they solve?",
     "ideal_answer": "Hooks let function components use state and lifecycle. Custom hooks share logic without classes or HOCs.",
     "keywords": ["usestate", "useeffect", "custom hooks", "state", "lifecycle", "reusable"]},
    {"category": "Frontend", "difficulty": "Advanced", "question": "How would you optimize the initial load time of a large React application?",
     "ideal_answer": "Code splitting, lazy loading, route splitting, bundle analysis, tree shaking, caching, CDN, SSR/prerendering.",
     "keywords": ["code splitting", "lazy", "bundle", "tree shaking", "caching", "cdna", "ssr"]},
    {"category": "Frontend", "difficulty": "Advanced", "question": "Explain server-side rendering versus static site generation versus client-side rendering.",
     "ideal_answer": "SSR renders on request per user; SSG pre-builds at build time; CSR renders in browser. Trade-offs: SEO, TTFB, hydration, data freshness.",
     "keywords": ["ssr", "ssg", "csr", "seo", "hydration", "ttfb", "build time"]},
    # Backend
    {"category": "Backend", "difficulty": "Beginner", "question": "What is a REST API and what are its core constraints?",
     "ideal_answer": "Representational State Transfer over HTTP. Client-server, stateless, cacheable, uniform interface, layered system, resource URIs and methods.",
     "keywords": ["http", "stateless", "client-server", "resources", "methods", "uniform interface"]},
    {"category": "Backend", "difficulty": "Intermediate", "question": "How does authentication differ from authorization?",
     "ideal_answer": "Authentication verifies identity (who you are); authorization determines access (what you can do). JWT/tokens for auth, roles/scopes for authorization.",
     "keywords": ["identity", "jwt", "tokens", "roles", "permissions", "scopes", "authorization"]},
    {"category": "Backend", "difficulty": "Intermediate", "question": "Explain how you would design a REST API authentication system.",
     "ideal_answer": "Stateless JWT flow, hashing passwords (bcrypt), refresh tokens, secure storage, rate limiting, revocation, scoped permissions.",
     "keywords": ["jwt", "refresh token", "bcrypt", "stateless", "revocation", "rate limiting"]},
    {"category": "Backend", "difficulty": "Advanced", "question": "How would you design a system to handle retries and idempotency in distributed APIs?",
     "ideal_answer": "Idempotency keys, stored outcomes, unique constraints, dedup, exponential backoff with jitter, retry budgets, dead-letter queues.",
     "keywords": ["idempotency", "retry", "backoff", "jitter", "dead-letter", "dedup"]},
    # Database
    {"category": "Database", "difficulty": "Beginner", "question": "What is the difference between SQL and NoSQL databases?",
     "ideal_answer": "SQL is relational, schema-enforced, ACID; NoSQL is flexible schema, horizontally scalable, different consistency models. Choice depends on access patterns.",
     "keywords": ["relational", "schema", "acid", "scalability", "document", "consistency"]},
    {"category": "Database", "difficulty": "Intermediate", "question": "How does indexing improve query performance and when does it hurt?",
     "ideal_answer": "Indexes allow B-tree/scans for fast lookups; add write and storage overhead; best on selective, frequently queried columns.",
     "keywords": ["b-tree", "seek", "write overhead", "selectivity", "composite index", "storage"]},
    {"category": "Database", "difficulty": "Advanced", "question": "Explain database normalization and denormalization trade-offs.",
     "ideal_answer": "Normalization removes redundancy/update anomalies via normal forms; denormalization adds redundancy for read performance. Trade-off: write cost vs read speed.",
     "keywords": ["normal forms", "redundancy", "anomalies", "joins", "read performance", "duplication"]},
    # AI/ML
    {"category": "AI/ML", "difficulty": "Beginner", "question": "What is the difference between machine learning and traditional programming?",
     "ideal_answer": "ML learns patterns from data instead of explicit rules; features and model, generalization from training examples.",
     "keywords": ["data", "patterns", "model", "training", "generalization", "features"]},
    {"category": "AI/ML", "difficulty": "Intermediate", "question": "Explain overfitting and how to prevent it.",
     "ideal_answer": "Model memorizes training noise and fails on new data. Prevent: regularization, dropout, more data, cross-validation, early stopping, simpler models.",
     "keywords": ["variance", "regularization", "dropout", "cross-validation", "early stopping", "generalization"]},
    {"category": "AI/ML", "difficulty": "Advanced", "question": "How do embeddings work and how are they used for semantic search?",
     "ideal_answer": "Embeddings map tokens/text into dense vectors where similarity reflects semantics; cosine similarity for nearest-neighbor retrieval.",
     "keywords": ["vector", "dense", "cosine similarity", "nearest neighbor", "semantic", "dimension"]},
    # RAG
    {"category": "RAG", "difficulty": "Beginner", "question": "What is Retrieval-Augmented Generation (RAG) and why do we need it?",
     "ideal_answer": "RAG retrieves relevant documents and feeds them to an LLM as context to ground answers, reduce hallucinations, and use up-to-date data without retraining.",
     "keywords": ["retrieval", "context", "grounding", "hallucination", "embedding", "llm"]},
    {"category": "RAG", "difficulty": "Intermediate", "question": "Explain the chunking strategy you would use for a RAG pipeline.",
     "ideal_answer": "Split documents into semantic chunks sized for the model context; overlap, respect section boundaries; tune chunk size to query granularity.",
     "keywords": ["chunk", "overlap", "semantic", "context window", "splitting", "boundaries"]},
    {"category": "RAG", "difficulty": "Advanced", "question": "How would you evaluate the quality of a RAG system?",
     "ideal_answer": "Retrieval metrics (recall@k, hit rate) + generation metrics (faithfulness, answer relevance, groundedness) on a golden eval set; A/B against baselines.",
     "keywords": ["recall", "hit rate", "faithfulness", "relevance", "groundedness", "eval set"]},
    {"category": "RAG", "difficulty": "Advanced", "question": "How do you handle tenant isolation and permissions in a multi-tenant RAG system?",
     "ideal_answer": "Isolate vector namespaces/collections per tenant, enforce document-level access control at query time, filter metadata, never cross-tenant retrieval.",
     "keywords": ["tenant", "namespace", "access control", "metadata filter", "isolation", "permissions"]},
    # DevOps
    {"category": "DevOps", "difficulty": "Beginner", "question": "What is the difference between Docker and Kubernetes?",
     "ideal_answer": "Docker containers package apps and dependencies; Kubernetes orchestrates containers across nodes — scheduling, scaling, self-healing, service discovery.",
     "keywords": ["container", "orchestration", "scheduling", "scaling", "nodes", "pods"]},
    {"category": "DevOps", "difficulty": "Intermediate", "question": "Explain how you would set up CI/CD for a web application.",
     "ideal_answer": "Pipeline stages: lint/test/build/scan, artifact, deploy to staging, smoke tests, promote to production; environment-separated config, rollback strategy.",
     "keywords": ["pipeline", "staging", "artifacts", "rollback", "smoke test", "deploy"]},
    {"category": "DevOps", "difficulty": "Advanced", "question": "How would you design a monitoring and alerting strategy for a production service?",
     "ideal_answer": "Golden signals (latency, traffic, errors, saturation), structured logs + metrics + traces, SLOs with alert budgets, runbooks, on-call escalation.",
     "keywords": ["golden signals", "slo", "metrics", "traces", "alert budget", "runbook"]},
    # System Design
    {"category": "System Design", "difficulty": "Intermediate", "question": "How would you design a URL shortener?",
     "ideal_answer": "Hash/encode IDs, redirect (302) mapping, distributed ID generation, database at scale, caching hot URLs, analytics, collision handling.",
     "keywords": ["hash", "redirect", "database", "cache", "collision", "scalability"]},
    {"category": "System Design", "difficulty": "Advanced", "question": "Design a real-time chat application at scale.",
     "ideal_answer": "WebSockets/gateways, presence service, message ordering, fan-out on write, offline sync, idempotent delivery, horizontal scaling, backpressure.",
     "keywords": ["websocket", "presence", "fan-out", "ordering", "idempotent", "gateway"]},
    {"category": "System Design", "difficulty": "Advanced", "question": "How would you design a multi-tenant SaaS application?",  
     "ideal_answer": "Tenant isolation (DB/schema/row), shared vs silo trade-offs, tenant-aware middleware, per-tenant rate limits/quota, security at data layer, cost metering.",
     "keywords": ["tenant", "isolation", "middleware", "quota", "metering", "schema"]},
    # Behavioral
    {"category": "Behavioral", "difficulty": "Beginner", "question": "Tell me about yourself.",
     "ideal_answer": "Concise past/present/future: brief background, current role/relevant work, and why this role fits. 60-90 seconds, evidence-based.",
     "keywords": ["past", "present", "future", "relevant", "concise"]},
    {"category": "Behavioral", "difficulty": "Intermediate", "question": "Describe a time you had to resolve a conflict on a team.",
     "ideal_answer": "Use STAR: Situation, Task, Action, Result. Focus on listening, compromise, and a positive measurable outcome.",
     "keywords": ["star", "situation", "action", "result", "conflict", "communication"]},
    {"category": "Behavioral", "difficulty": "Intermediate", "question": "Tell me about a project you are most proud of.",
     "ideal_answer": "Pick relevant work, explain your role, technical decisions, challenges, and measurable impact. Use STAR format.",
     "keywords": ["star", "situation", "action", "result", "impact", "contribution"]},
    # HR
    {"category": "HR", "difficulty": "Beginner", "question": "Tell me about your strengths and weaknesses.",
     "ideal_answer": "Strongest strengths tied to role requirements with evidence; honest weakness you are actively improving with a concrete plan.",
     "keywords": ["role requirements", "evidence", "honest", "improvement plan", "relevant"]},
    {"category": "HR", "difficulty": "Intermediate", "question": "Why do you want to work at our company?",
     "ideal_answer": "Show researched alignment: company mission, product, team, growth; connect to your skills and goals with specifics.",
     "keywords": ["research", "mission", "product", "alignment", "specifics"]},
    # Project
    {"category": "Project", "difficulty": "Intermediate", "question": "Walk me through a technical project you built from scratch.",
     "ideal_answer": "Motivation/problem, architecture, tech choices with reasons, trade-offs, results/impact, and lessons learned.",
     "keywords": ["problem", "architecture", "trade-offs", "impact", "lessons"]},
    {"category": "Project", "difficulty": "Advanced", "question": "What is the most technically difficult problem you have solved and how?",
     "ideal_answer": "Define the problem precisely, your investigation/debugging process, the attempted approaches, the final solution, and measurable outcome.",
     "keywords": ["problem", "debugging", "approaches", "solution", "outcome"]},
]


def _question_payload(q: dict) -> dict:
    return {
        "category": q["category"],
        "difficulty": q["difficulty"],
        "question": q["question"],
        "ideal_answer": q["ideal_answer"],
        "keywords": q["keywords"],
        "tags": [],
    }


def filter_bank(category: str | None = None, difficulty: str | None = None, limit: int = 200, offset: int = 0) -> list[dict]:
    questions = QUESTION_BANK
    if category and category != "All":
        questions = [q for q in questions if q["category"] == category]
    if difficulty and difficulty != "All":
        questions = [q for q in questions if q["difficulty"] == difficulty]
    return [_question_payload(q) for q in questions[offset : offset + limit]]


def build_session_from_bank(question_docs: list, count: int = 10) -> list[dict]:
    """Build session questions from persisted InterviewQuestion documents."""
    from app.models.interview_model import QuestionRef
    selected = (question_docs or [])[: max(count, 1)]
    return [
        QuestionRef(
            id=str(q.id),
            question=q.question,
            category=q.category,
            difficulty=q.difficulty,
            ideal_answer=q.ideal_answer,
            keywords=q.keywords,
        ).model_dump(by_alias=True)
        for q in selected
    ]


def generate_project_questions(project: dict) -> list[dict]:
    """Generate interview questions grounded in an actual Career Vault project."""
    name = project.get("name") or "your project"
    tech = project.get("technologies") or ""
    desc = project.get("description") or ""
    stack = [t.strip() for t in (tech.split(",") if isinstance(tech, str) else tech or []) if t.strip()]
    stack_lower = " ".join(stack).lower()

    questions = [
        {"category": "Project", "difficulty": "Advanced",
         "question": f"Why did you choose the tech stack for {name} and what were the trade-offs?",
         "ideal_answer": "Compare alternatives, state decision drivers (performance, team, ecosystem), acknowledge trade-offs.",
         "keywords": ["trade-off", "alternative", "decision", "why", "stack"]},
        {"category": "Project", "difficulty": "Intermediate",
         "question": f"Explain the architecture of {name} and how data flows through it.",
         "ideal_answer": "Components/modules, request flow, data storage, integration points.",
         "keywords": ["architecture", "data flow", "components", "api", "storage"]},
        {"category": "Project", "difficulty": "Beginner",
         "question": f"Walk me through the core feature of {name} end to end.",
         "ideal_answer": "User need, journey, implementation steps, and outcome.",
         "keywords": ["feature", "user", "journey", "implementation", "outcome"]},
    ]

    if any(t in stack_lower or t in desc.lower() for t in ["rag", "llm", "embedding", "langchain", "chroma", "ai"]):
        questions.append({"category": "RAG", "difficulty": "Advanced",
                          "question": f"How does the RAG pipeline work in {name} and how did you evaluate its answers?",
                          "ideal_answer": "Ingestion, chunking, embedding/retrieval, prompt context, and quality evaluation (recall, faithfulness).",
                          "keywords": ["chunking", "embedding", "retrieval", "recall", "faithfulness", "rag"]})
        questions.append({"category": "RAG", "difficulty": "Advanced",
                          "question": f"How did you handle tenant isolation and permissions in {name}?",
                          "ideal_answer": "Per-tenant namespaces/collections, metadata filtering, access control at query time.",
                          "keywords": ["tenant", "namespace", "permissions", "metadata", "isolation"]})

    if any(t in stack_lower for t in ["fastapi", "django", "flask", "node", "express", "spring", "rails"]):
        questions.append({"category": "Backend", "difficulty": "Intermediate",
                          "question": f"How would you scale {name} to serve many more users?",
                          "ideal_answer": "Load balancing, caching, database indexing/replication, queueing, monitoring, horizontal scaling.",
                          "keywords": ["caching", "indexing", "replication", "queue", "monitoring", "scale"]})

    if any(t in stack_lower for t in ["postgres", "mysql", "mongodb", "redis", "sqlite"]):
        questions.append({"category": "Database", "difficulty": "Intermediate",
                          "question": f"How did you design the data model for {name} and would you change anything?",
                          "ideal_answer": "Schema/collections, relationships, indexing, migrations, and lessons learned.",
                          "keywords": ["schema", "model", "indexing", "migrations", "relationships"]})

    if any(t in stack_lower for t in ["docker", "kubernetes", "aws", "azure", "gcp", "nginx", "terraform"]):
        questions.append({"category": "DevOps", "difficulty": "Intermediate",
                          "question": f"How did you deploy and monitor {name} in production?",
                          "ideal_answer": "Build/pipeline, hosting, env config, logging/metrics, rollback.",
                          "keywords": ["deploy", "pipeline", "logging", "metrics", "rollback"]})

    questions.append({"category": "Project", "difficulty": "Advanced",
                      "question": f"What was the hardest technical problem you solved while building {name}?",
                      "ideal_answer": "Problem definition, debugging process, alternatives tried, final solution, measurable result.",
                      "keywords": ["problem", "debugging", "solution", "result", "alternatives"]})

    dedupe = []
    seen = set()
    for q in questions:
        if q["question"] not in seen:
            seen.add(q["question"])
            dedupe.append(q)
    return dedupe[:8]


def compute_answer_feedback(question: dict, answer: str) -> dict:
    """Deterministic, evidence-based feedback on a candidate's answer."""
    answer = (answer or "").strip()
    answering = answer.lower()
    keywords = [k.lower() for k in question.get("keywords", [])]

    if not answer:
        return {
            "score": 0, "hits": 0, "total": len(keywords), "suggestion": "Try to answer out loud even briefly.",
            "strengths": [], "improvements": ["Provide any structured answer — every attempt counts."],
            "communication": 0, "technical_coverage": 0, "answer_structure": 0,
        }

    hits = [k for k in keywords if k in answering]
    coverage = round(len(hits) / max(len(keywords), 1) * 100)

    word_count = len(answer.split())
    communication = min(95, round(45 + word_count * 0.5 + (10 if 40 <= word_count <= 260 else 0)))
    communication = max(15, communication)

    structure_markers = sum(
        1 for m in ["first", "second", "third", "finally", "in conclusion", "then", "for example", "because"]
        if m in answering
    )
    structure = min(100, round(20 + structure_markers * 20 + (15 if 40 <= word_count <= 260 else 0)))

    strengths = []
    improvements = []
    if hits:
        strengths.append("Covered key concepts: " + ", ".join(h[:1].upper() + h[1:] for h in hits[:4]))
    else:
        improvements.append("None of the expected key points were mentioned explicitly.")
        strengths.append("You answered — that is the foundation.")
    if word_count < 30:
        improvements.append("Expand your answer with a structured explanation (context → reasoning → example).")
    elif word_count > 300:
        improvements.append("Tighten the answer — stay focused on the core concept and skip tangents.")
    if structure_markers == 0:
        improvements.append("Use signposting (first / then / finally) to make your reasoning easy to follow.")

    technical = max(15, min(100, coverage + (10 if structure_markers else 0)))
    overall = round(0.4 * technical + 0.35 * communication + 0.25 * structure)

    return {
        "score": overall,
        "hits": len(hits),
        "total": len(keywords),
        "covered": hits,
        "missing": [k for k in keywords if k not in hits],
        "communication": communication,
        "technical_coverage": technical,
        "answer_structure": structure,
        "strengths": strengths,
        "improvements": improvements,
        "suggestion": "Good base. Structure it clearly and always tie the concept to a concrete example." if overall >= 70 else
                      "Re-read the ideal answer and try again — focus on the key terms mentioned in the feedback.",
    }