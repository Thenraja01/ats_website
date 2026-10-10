"""End-to-End Test: Verify Web Research, Celery Task & Dynamic Interview Pack Generation."""

import asyncio
import httpx
from app.main import app
from app.core.database import init_db
from app.services.web_search_service import research_interview_context
from app.tasks.interview_tasks import generate_deep_interview_pack_task
from app.models.user_model import User
from app.core.security import hash_password

TEST_EMAIL = "testuser@hiremind.ai"
TEST_PASSWORD = "Test@123"

SAMPLE_RESUME = """
Candidate: Alex Chen
Senior Backend Engineer
Experience:
- Designed real-time event streaming pipeline using Python, FastAPI, Redis, and Kafka.
- Architected distributed caching layer saving 40% database read overhead in MongoDB.
- Reduced API p99 latency from 450ms to 65ms with query optimization and Redis connection pooling.
Skills: Python, FastAPI, Redis, MongoDB, Docker, System Design, Kafka, Microservices
"""


async def run_deep_prep_test():
    print("\n" + "=" * 65)
    print(">> Starting Celery Deep Research & Interview Pack Generation Test")
    print("=" * 65)

    # 1. Initialize MongoDB
    await init_db()

    # 2. Test Web Research Tool
    print("\n[Step 1] Running Web Research Agent for 'Amazon' + 'Senior Backend Engineer'...")
    research_results = research_interview_context(
        role="Senior Backend Engineer",
        company="Amazon",
        skills=["Python", "FastAPI", "Redis", "Kafka"],
    )
    print("[OK] Real-World Research Results:")
    print(f"   - Company: {research_results['company']}")
    print(f"   - Role:    {research_results['role']}")
    print(f"   - Tech Trends Found:     {len(research_results['tech_trends'])} sources")
    print(f"   - Aptitude Trends Found: {len(research_results['aptitude_trends'])} sources")
    print(f"   - Snippet Preview:       {research_results['tech_trends'][0][:120]}...")

    # 3. Authenticate User
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("\n[Step 2] Authenticating test user...")
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_data = login_res.json()
        user_id = auth_data["user"]["id"]
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Authenticated (User ID: {user_id})")

        # 4. Trigger Celery Task Dispatch via API
        print("\n[Step 3] Calling POST /api/v1/interview/generate-deep-prep...")
        prep_req = {
            "role": "Senior Backend Engineer",
            "company": "Amazon",
            "resume_text": SAMPLE_RESUME,
            "skills": ["Python", "FastAPI", "Redis", "Kafka"],
        }
        dispatch_res = await client.post(
            "/api/v1/interview/generate-deep-prep",
            headers=headers,
            json=prep_req,
        )
        assert dispatch_res.status_code == 200, f"Dispatch failed: {dispatch_res.text}"
        task_data = dispatch_res.json()
        task_id = task_data.get("task_id")
        print(f"[OK] Task dispatched to Celery/Redis queue!")
        print(f"   - Task ID: {task_id}")
        print(f"   - Status:  {task_data.get('status')}")

        # 5. Check Task Status Endpoint
        print("\n[Step 4] Polling GET /api/v1/interview/task-status/{task_id}...")
        status_res = await client.get(
            f"/api/v1/interview/task-status/{task_id}",
            headers=headers,
        )
        assert status_res.status_code == 200, f"Status check failed: {status_res.text}"
        print(f"[OK] Task Status Endpoint returned: {status_res.json()}")

        # 6. Execute Task Worker Pipeline & Verify Generated Pack
        print("\n[Step 5] Executing full background worker pipeline (Web Search + Ollama llama3.2)...")
        task_payload = {
            "user_id": user_id,
            "role": "Senior Backend Engineer",
            "company": "Amazon",
            "resume_text": SAMPLE_RESUME,
            "skills": ["Python", "FastAPI", "Redis", "Kafka"],
        }

        # Run Celery task using .apply() for synchronous test verification
        celery_async_res = generate_deep_interview_pack_task.apply(args=[task_payload])
        worker_result = celery_async_res.result
        if isinstance(worker_result, Exception):
            print("\n[ERROR] Celery Task failed with exception:")
            print(f"Exception: {worker_result}")
            print(f"Traceback:\n{celery_async_res.traceback}")
            raise worker_result

        print("\n[OK] Celery Background Worker Completed Successfully!")
        print(f"   - Generated Session ID: {worker_result.get('session_id')}")
        print(f"   - Total Questions:      {worker_result.get('question_count')}")
        print(f"   - Source Pipeline:      {worker_result.get('source')}")

        # 7. Fetch the Generated Session from API
        session_id = worker_result["session_id"]
        session_res = await client.get(
            f"/api/v1/interview/sessions/{session_id}",
            headers=headers,
        )
        assert session_res.status_code == 200, f"Session retrieval failed: {session_res.text}"
        session_details = session_res.json()
        print(f"\n[OK] Retrieved Generated Session from Workspace:")
        print(f"   - Title: {session_details.get('title')}")
        for i, q in enumerate(session_details.get("questions", [])[:3]):
            print(f"   - Round {i+1} [{q.get('category')} - {q.get('difficulty')}]: {q.get('question', '')[:90]}...")
            ideal = q.get("idealAnswer") or q.get("ideal_answer") or "N/A"
            print(f"       Ideal Answer: {ideal[:80]}...")
            print(f"       Keywords:     {', '.join(q.get('keywords', []))}")

    print("\n" + "=" * 65)
    print("ALL TESTS PASSED: Celery + Web Search + Ollama Deep Prep Active!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(run_deep_prep_test())
