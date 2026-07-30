"""Tests for the ATS pipeline service."""


def test_ats_pipeline_returns_expected_keys(sample_resume_text, sample_jd_text):
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline(sample_resume_text, sample_jd_text)
    assert isinstance(result, dict)
    assert "ats_score" in result
    assert "eligible" in result
    assert "missing_skills" in result
    assert isinstance(result["missing_skills"], list)
    assert "suggestions" in result
    assert isinstance(result["suggestions"], list)
    assert "interview_questions" in result
    assert isinstance(result["interview_questions"], list)
    assert "extracted_skills" in result
    assert isinstance(result["extracted_skills"], list)


def test_ats_pipeline_score_range(sample_resume_text, sample_jd_text):
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline(sample_resume_text, sample_jd_text)
    score = result["ats_score"]
    assert 0 <= score <= 100


def test_ats_pipeline_eligible_boolean(sample_resume_text, sample_jd_text):
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline(sample_resume_text, sample_jd_text)
    assert isinstance(result["eligible"], bool)


def test_ats_pipeline_with_empty_text():
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline("", "")
    assert isinstance(result, dict)
    assert result["ats_score"] >= 0


def test_ats_pipeline_suggestions_format(sample_resume_text, sample_jd_text):
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline(sample_resume_text, sample_jd_text)
    for s in result["suggestions"]:
        assert isinstance(s, str)
        assert len(s) > 0


def test_ats_pipeline_interview_questions_format(sample_resume_text, sample_jd_text):
    from app.services.ats_service import run_ats_pipeline
    result = run_ats_pipeline(sample_resume_text, sample_jd_text)
    for q in result["interview_questions"]:
        assert isinstance(q, str)
        assert len(q) > 0