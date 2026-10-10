"""End-to-End Test: Authenticate testuser, upload resume document, and verify MinIO storage."""

import asyncio
import io
import httpx
from app.main import app
from app.core.database import init_db
from app.models.user_model import User
from app.core.security import hash_password
from app.services.storage_service import get_s3_client
from app.core.config import settings

TEST_EMAIL = "testuser@hiremind.ai"
TEST_NAME = "Test User"
TEST_PASSWORD = "Test@123"

SAMPLE_RESUME_TEXT = """
Jane Doe
Senior Full-Stack Engineer
Email: testuser@hiremind.ai | Phone: 555-0199 | Location: San Francisco, CA

SUMMARY
Experienced Full-Stack Software Engineer with 6+ years specializing in Python, FastAPI, React, TypeScript, Redis, and distributed systems.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: FastAPI, Django, React, Next.js, Node.js
Databases & Cloud: MongoDB, Redis, PostgreSQL, AWS, Docker, MinIO

EXPERIENCE
Lead Software Engineer | CloudTech Solutions (2021 - Present)
- Designed and maintained high-throughput microservices handling 10M+ daily events.
- Integrated S3-compatible MinIO object storage for scalable document workflows.
"""


async def run_test():
    print("\n" + "=" * 60)
    print(">> Starting MinIO & Backend Resume Upload Verification Test")
    print("=" * 60)

    # 1. Initialize MongoDB connection
    print("\n[Step 1] Initializing database...")
    await init_db()

    # 2. Ensure testuser exists with password Test@123
    print(f"\n[Step 2] Ensuring test user '{TEST_EMAIL}' exists with password '{TEST_PASSWORD}'...")
    existing = await User.find_one(User.email == TEST_EMAIL)
    if existing:
        existing.password = hash_password(TEST_PASSWORD)
        await existing.save()
        print(f"[OK] Existing test user updated (ID: {existing.id})")
    else:
        new_user = User(
            name=TEST_NAME,
            email=TEST_EMAIL,
            password=hash_password(TEST_PASSWORD),
        )
        await new_user.insert()
        print(f"[OK] New test user registered (ID: {new_user.id})")

    # 3. Test HTTP login via FastAPI app
    print("\n[Step 3] Testing authentication via /api/v1/auth/login...")
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://testserver") as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        )
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        auth_data = login_res.json()
        token = auth_data["access_token"]
        print(f"[OK] Login successful! Obtained JWT Bearer token: {token[:20]}...")

        # 4. Upload resume document via /api/v1/resume/upload
        print("\n[Step 4] Uploading resume document via POST /api/v1/resume/upload...")
        headers = {"Authorization": f"Bearer {token}"}
        file_bytes = SAMPLE_RESUME_TEXT.encode("utf-8")
        files = {
            "file": ("jane_doe_resume.txt", file_bytes, "text/plain")
        }

        upload_res = await client.post(
            "/api/v1/resume/upload",
            headers=headers,
            files=files,
        )
        print(f"Upload Status Code: {upload_res.status_code}")
        assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"

        upload_data = upload_res.json()
        print("[OK] API Response Data:")
        print(f"   - Filename:        {upload_data.get('filename')}")
        print(f"   - Stored in MinIO: {upload_data.get('stored_in_minio')}")
        print(f"   - Storage Key:     {upload_data.get('storage_key')}")
        print(f"   - Extracted Chars: {len(upload_data.get('extracted_text', ''))}")

        storage_key = upload_data.get("storage_key")
        assert storage_key, "Error: storage_key was not returned by API!"
        assert upload_data.get("stored_in_minio") is True, "Error: stored_in_minio is not True!"

        # 5. Verify object directly inside MinIO S3
        print(f"\n[Step 5] Directly inspecting MinIO bucket '{settings.MINIO_BUCKET}' for key '{storage_key}'...")
        s3 = get_s3_client()
        obj = s3.get_object(Bucket=settings.MINIO_BUCKET, Key=storage_key)
        downloaded_bytes = obj["Body"].read()

        print(f"[OK] Object retrieved from MinIO!")
        print(f"   - Content Length:  {obj['ContentLength']} bytes")
        print(f"   - Content Type:    {obj['ContentType']}")
        print(f"   - Last Modified:   {obj['LastModified']}")

        assert downloaded_bytes == file_bytes, "Error: Uploaded content does not match retrieved MinIO content!"
        print("[OK] Hash/content check passed: Uploaded bytes exactly match MinIO bytes!")

        # 6. Test presigned download URL
        print("\n[Step 6] Testing presigned download URL generation...")
        download_res = await client.get(
            f"/api/v1/resume/download/{storage_key}",
            headers=headers,
        )
        assert download_res.status_code == 200, f"Download URL failed: {download_res.text}"
        download_url = download_res.json().get("download_url")
        print(f"[OK] Presigned URL generated: {download_url}")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED: Resume was uploaded and verified in MinIO!")
    print("=" * 60 + "\n")



if __name__ == "__main__":
    asyncio.run(run_test())
