"""Tests for security utilities."""

from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.utils.validators import validate_password, validate_email, validate_file_size


def test_password_hashing():
    password = "MySecurePass123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)


def test_password_hashing_unicode():
    password = "Pässwörd123"
    hashed = hash_password(password)
    assert verify_password(password, hashed)


def test_password_hashing_wrong_password():
    hashed = hash_password("CorrectPass123")
    assert not verify_password("WrongPass123", hashed)


def test_jwt_token():
    data = {"id": "123", "email": "test@example.com", "role": "candidate"}
    token = create_access_token(data)
    decoded = decode_token(token)
    assert decoded["id"] == "123"
    assert decoded["email"] == "test@example.com"
    assert decoded["role"] == "candidate"


def test_validate_password():
    assert validate_password("Strong1Pass") is True
    assert validate_password("weak") is False
    assert validate_password("nouppercase1") is False
    assert validate_password("NODIGITS") is False
    assert validate_password("Sh0rt") is False


def test_validate_email():
    assert validate_email("user@example.com") is True
    assert validate_email("invalid-email") is False
    assert validate_email("@example.com") is False


def test_validate_file_size():
    assert validate_file_size(100, 1000) is True
    assert validate_file_size(2000, 1000) is False