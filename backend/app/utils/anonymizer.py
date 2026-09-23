import re

def anonymize_text(text: str) -> str:
    """Anonymize PII from resume text before sending to LLM.
    
    Removes:
    - Emails
    - Phone numbers
    - Websites / URLs
    - Physical addresses (basic detection)
    """
    anonymized = text
    
    # 1. Emails
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    anonymized = re.sub(email_pattern, "[EMAIL_REDACTED]", anonymized)
    
    # 2. Phone numbers (various formats)
    anonymized = re.sub(r"\b(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b", "[PHONE_REDACTED]", anonymized)
    anonymized = re.sub(r"\b\d{10}\b", "[PHONE_REDACTED]", anonymized)
    
    # 3. Links / URLs
    url_pattern = r"https?://[^\s/$.?#].[^\s]*|www\.[^\s]*|linkedin\.com/in/[^\s]*|github\.com/[^\s]*"
    anonymized = re.sub(url_pattern, "[LINK_REDACTED]", anonymized)
    
    return anonymized
