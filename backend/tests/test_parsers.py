"""Tests for resume parsers and text utilities."""

from app.parsers.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.parsers.text_cleaner import TextCleaner
from app.parsers.keyword_extractor import KeywordExtractor


def test_text_cleaner_removes_null_chars():
    result = TextCleaner.clean("Hello\x00World")
    assert "\x00" not in result


def test_text_cleaner_normalizes_spaces():
    result = TextCleaner.clean("Hello    World\n\nTest")
    assert "  " not in result


def test_text_cleaner_handles_empty():
    assert TextCleaner.clean("") == ""
    assert TextCleaner.clean(None) == ""


def test_text_cleaner_lowercase():
    result = TextCleaner.clean("Hello World")
    assert result == "hello world"


def test_keyword_extractor_skills():
    extractor = KeywordExtractor()
    skill_map = {
        "languages": ["Python", "JavaScript"],
        "frameworks": ["React", "Django"],
    }
    text = "Experienced with Python and React"
    result = extractor.extract_skills(text, skill_map)
    assert "Python" in result["languages"]
    assert "React" in result["frameworks"]
    assert "JavaScript" not in result["languages"]


def test_keyword_extractor_emails():
    extractor = KeywordExtractor()
    text = "Contact me at user@example.com or admin@test.org"
    emails = extractor.extract_emails(text)
    assert "user@example.com" in emails
    assert "admin@test.org" in emails


def test_keyword_extractor_phones():
    extractor = KeywordExtractor()
    text = "Call me at 1234567890"
    phones = extractor.extract_phones(text)
    assert len(phones) > 0


def test_keyword_extractor_experience():
    extractor = KeywordExtractor()
    text = "5 years of experience in software development"
    years = extractor.extract_years_of_experience(text)
    assert years == 5


def test_text_cleaner_extract_sentences():
    result = TextCleaner.extract_sentences("Hello world. This is a test. And another.")
    assert len(result) == 3


def test_text_cleaner_extract_paragraphs():
    result = TextCleaner.extract_paragraphs("Para one.\n\nPara two.\n\nPara three.")
    assert len(result) == 3