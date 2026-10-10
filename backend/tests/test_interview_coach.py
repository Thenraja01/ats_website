"""End-to-End Test: Test FastAPI + Ollama Interview Coach with 4-Dimension Rubric."""

import asyncio
import httpx
from app.main import app
from app.core.database import init_db
from app.models.user_model import User
from app.core.security import hash_password

TEST_EMAIL = "testuser@hiremind.ai"
TEST_PASSWORD = "Test@123"


async def run_interview_test():
    print("\n" + "=" * 60)
    print(">> Starting FastAPI + Ollama Interview Coach Test")
    print("=" * 60)

    # 1. Initialize MongoDB
    await init_db()

    # 2. Authenticate
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        print("\n[Step 1] Authenticating test user...")
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("[OK] Authenticated successfully.")

        # 3. Start a mock interview session
        print("\n[Step 2] Creating interview session for 'Senior Backend Developer'...")
        start_res = await client.post(
            "/api/v1/interview/sessions",
            headers=headers,
            json={
                "session_type": "mock",
                "title": "Backend Engineering Interview",
                "job_title": "Senior Backend Developer",
                "count": 3,
                "category": "Backend",
            },
        )
        assert start_res.status_code == 200, f"Start failed: {start_res.text}"
        session_data = start_res.json()
        session_id = session_data["id"]
        first_q = session_data["questions"][0]
        print(f"[OK] Session created (ID: {session_id})")
        print(f"     Question 1: {first_q.get('question')}")

        # 4. Submit an answer and get Ollama AI evaluation
        print("\n[Step 3] Submitting answer & triggering Ollama llama3.2 evaluation...")
        candidate_answer = (
            "A REST API uses standard HTTP methods like GET, POST, PUT, and DELETE to manage resources. "
            "It is stateless, meaning every request must contain all the information necessary to fulfill it. "
            "For authentication, we typically use JWT bearer tokens, and for error handling we return standard HTTP status codes "
            "like 400 for bad input and 404 for not found."
        )

        answer_res = await client.post(
            f"/api/v1/interview/sessions/{session_id}/answer",
            headers=headers,
            json={"index": 0, "answer": candidate_answer},
        )
        assert answer_res.status_code == 200, f"Answer failed: {answer_res.text}"
        answer_data = answer_res.json()
        feedback = answer_data.get("feedback", {})

        print("\n[OK] Ollama AI Evaluation Received:")
        print(f"   - Overall Score:        {feedback.get('score')}/100")
        print(f"   - Technical Coverage:   {feedback.get('technical_coverage')}/100")
        print(f"   - Communication:        {feedback.get('communication')}/100")
        print(f"   - Answer Structure:     {feedback.get('answer_structure')}/100")
        print(f"   - AI Evaluated Flag:    {feedback.get('ai_evaluated')}")
        print(f"   - Feedback Summary:     {feedback.get('feedback')}")
        print(f"   - Identified Strengths: {feedback.get('strengths')}")
        print(f"   - Improvements:         {feedback.get('improvements')}")
        if feedback.get("scores"):
            print("   - 4-Dimension Rubric Breakdown:")
            for s in feedback["scores"]:
                print(f"       * {s.get('dimension')}: {s.get('score')}/5 - {s.get('notes')}")

        # 5. Complete session
        print("\n[Step 4] Completing interview session...")
        complete_res = await client.post(
            f"/api/v1/interview/sessions/{session_id}/complete",
            headers=headers,
        )
        assert complete_res.status_code == 200, f"Complete failed: {complete_res.text}"
        final_summary = complete_res.json().get("feedback", {})
        print(f"[OK] Interview report generated! Final Overall Score: {final_summary.get('overall')}/100")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED: Native FastAPI + Ollama Coach is active!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(run_interview_test())
