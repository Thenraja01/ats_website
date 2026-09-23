"""Test configuration and fixtures.

NOTE: API-level tests (using async_client) require a running MongoDB instance.
Unit tests (test_security, test_ats_service, test_parsers) do not require MongoDB.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings


@pytest.fixture
def test_settings():
    return settings


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client



@pytest.fixture
def sample_resume_text():
    return """
    John Doe
    Software Engineer
    
    Skills: Python, JavaScript, React, Node.js, MongoDB, AWS
    
    Experience:
    Senior Developer at TechCorp (2020-present)
    - Built microservices using Python and Node.js
    - Led team of 5 developers
    
    Education:
    B.S. Computer Science, MIT (2016-2020)
    
    Projects:
    - E-commerce platform built with React/Node.js
    """


@pytest.fixture
def sample_jd_text():
    return """
    Senior Software Engineer
    
    Required Skills:
    - Python, JavaScript, React
    - AWS, Docker
    - 5+ years experience
    
    Responsibilities:
    - Design and build scalable web applications
    - Lead engineering team
    - Code review and mentoring
    """