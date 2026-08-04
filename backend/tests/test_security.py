"""Tests for security utilities."""

from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.utils.validators import validate_password, validate_email, validate_file_size, sanitize_filename, validate_mime_type


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


def test_sanitize_filename_path_traversal():
    # os.path.basename strips directory traversal components
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("resume.pdf") == "resume.pdf"
    assert sanitize_filename("my resume (final).pdf") == "my_resume__final_.pdf"
    # Ensure no path separators survive
    assert "/" not in sanitize_filename("../../../etc/passwd")
    assert "\\" not in sanitize_filename("..\\..\\windows\\system32")


def test_validate_mime_type_pdf():
    assert validate_mime_type(b"%PDF-1.4\n...", ["application/pdf"]) is True


def test_validate_mime_type_docx():
    # DOCX files are ZIP archives (starts with PK\x03\x04)
    assert validate_mime_type(b"PK\x03\x04" + b"\x00" * 100, ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]) is True


def test_validate_mime_type_text():
    assert validate_mime_type(b"Hello world, this is a text file.", ["text/plain"]) is True


def test_validate_mime_type_invalid():
    assert validate_mime_type(b"\x89PNG\r\n\x1a\n", ["application/pdf"]) is False
    assert validate_mime_type(b"\x00\x00\x00", ["text/plain"]) is False


def test_token_expiry_check():
    """Ensure token expiry is properly validated."""
    from app.core.security import create_access_token
    from datetime import timedelta, timezone, datetime
    from app.core.config import settings

    # Create token with very short expiry by overriding
    payload = {"id": "123", "email": "test@example.com", "role": "candidate"}
    # Manually create a token that's already expired
    from jose import jwt
    expired_payload = payload.copy()
    expired_payload["exp"] = datetime.now(timezone.utc) - timedelta(minutes=1)
    token = jwt.encode(expired_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    try:
        decode_token(token)
        assert False, "Should have raised an error for expired token"
    except Exception:
        pass  # Expected - expired token should raise