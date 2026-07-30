"""Tests for authentication endpoints."""

import pytest


@pytest.mark.asyncio
async def test_signup(async_client):
    response = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "TestPass123",
            "role": "candidate",
        },
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Account created"


@pytest.mark.asyncio
async def test_signup_duplicate_email(async_client):
    response = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "TestPass123",
            "role": "candidate",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login(async_client):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "TestPass123",
        },
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 400
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_weak_password_rejected(async_client):
    response = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Weak Password User",
            "email": "weak@example.com",
            "password": "short",
            "role": "candidate",
        },
    )
    assert response.status_code == 400