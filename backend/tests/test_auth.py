"""Tests for authentication endpoints."""

import pytest


async def _get_otp_and_signup(async_client, email, password, name):
    """Helper: send OTP, extract dev code (if SMTP not configured), verify, then sign up."""
    await async_client.post("/api/v1/auth/send-otp", json={"email": email, "purpose": "signup"})

    # In dev (no SMTP), OTP is stored in DB. We query it directly.
    from app.models.otp_model import OTPCode
    from datetime import datetime, timezone
    otp_record = await OTPCode.find_one(
        OTPCode.email == email,
        OTPCode.purpose == "signup",
        OTPCode.used == False,
        OTPCode.expires_at > datetime.now(timezone.utc),
    )
    otp_code = otp_record.code if otp_record else "000000"

    await async_client.post("/api/v1/auth/verify-otp", json={"email": email, "code": otp_code, "purpose": "signup"})

    response = await async_client.post(
        f"/api/v1/auth/signup?otp_code={otp_code}",
        json={"name": name, "email": email, "password": password},
    )
    return response


@pytest.mark.asyncio
async def test_signup(async_client):
    response = await _get_otp_and_signup(
        async_client, "test@example.com", "TestPass123", "Test User"
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Account created"


@pytest.mark.asyncio
async def test_signup_duplicate_email(async_client):
    # First signup should succeed
    await _get_otp_and_signup(
        async_client, "test@example.com", "TestPass123", "Test User"
    )
    # Second signup with same email should fail
    response = await _get_otp_and_signup(
        async_client, "test@example.com", "TestPass123", "Test User"
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_signup_requires_otp(async_client):
    """Signup without OTP code should fail."""
    response = await async_client.post(
        "/api/v1/auth/signup",
        json={"name": "No OTP User", "email": "nootp@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 400
    assert "OTP" in response.json()["detail"]


@pytest.mark.asyncio
async def test_signup_rejects_admin_role(async_client):
    """Signup should not allow specifying role — role is forced to candidate."""
    await async_client.post("/api/v1/auth/send-otp", json={"email": "admin@example.com", "purpose": "signup"})

    from app.models.otp_model import OTPCode
    from datetime import datetime, timezone
    otp_record = await OTPCode.find_one(
        OTPCode.email == "admin@example.com",
        OTPCode.purpose == "signup",
        OTPCode.used == False,
        OTPCode.expires_at > datetime.now(timezone.utc),
    )
    otp_code = otp_record.code if otp_record else "000000"

    # Send role=organization_admin — should be ignored
    response = await async_client.post(
        f"/api/v1/auth/signup?otp_code={otp_code}",
        json={"name": "Admin Wannabe", "email": "admin@example.com", "password": "TestPass123", "role": "organization_admin"},
    )
    assert response.status_code == 200

    # Verify the created user is a candidate, not admin
    from app.models.user_model import User
    user = await User.find_one(User.email == "admin@example.com")
    assert user.role.value == "candidate"


@pytest.mark.asyncio
async def test_login(async_client):
    # Signup first
    await _get_otp_and_signup(
        async_client, "login@example.com", "TestPass123", "Login User"
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_weak_password_rejected(async_client):
    response = await async_client.post(
        "/api/v1/auth/signup?otp_code=000000",
        json={"name": "Weak Password User", "email": "weak@example.com", "password": "short"},
    )
    assert response.status_code == 400
