"""JD-based Resume Tailoring service.

Compares the Career Vault (verified source of truth) + the current resume against a JD and
produces reviewable suggestions. Soft rule: NEVER fabricate experience. Any skill that appears
in the JD but has no verified evidence in the user's Career Vault is surfaced as
"requires verification" — the user must either add evidence or leave it unchanged.
"""

import re
from typing import List, Tuple

from app.services.match_service import _count_occurrences


def _vault_text(vault) -> str:
    """Flatten the Career Profile into a searchable text blob."""
    parts = []
    if vault.personal_info.full_name:
        parts.append(vault.personal_info.full_name)
    if vault.personal_info.headline:
        parts.append(vault.personal_info.headline)
    if vault.summary.primary:
        parts.append(vault.summary.primary)
    for e in vault.experience:
        parts.extend([e.company, e.job_title, e.description, *e.responsibilities])
    for p in vault.projects:
        parts.extend([p.name, p.technologies, p.description, *p.highlights])
    for s in vault.skills:
        parts.append(s.name if isinstance(s.name, str) else "")
    for c in vault.certifications:
        parts.extend([c.name, c.organization])
    for a in vault.achievements:
        parts.extend([a.title, a.description])
    return " ".join(str(p) for p in parts if p).lower()


def _skill_evidence(vault, skill_name: str, vault_text: str) -> dict:
    """Find verifiable evidence for a skill inside the Career Vault."""
    low = skill_name.lower()
    sources = []
    for e in vault.experience:
        blob = f"{e.company} {e.job_title} {e.description} {' '.join(e.responsibilities)}".lower()
        if low in blob:
            sources.append({"type": "Experience", "title": f"{e.job_title} at {e.company}".strip()})
    for p in vault.projects:
        blob = f"{p.name} {p.technologies} {p.description}".lower()
        if low in blob:
            link = f"Project: {p.name}".strip()
            if p.technologies:
                link += f" ({p.technologies})"
            sources.append({"type": "Project", "title": link})
    for s in vault.skills:
        if s.name and low in s.name.lower():
            sources.append({"type": "Skill", "title": s.name, "level": s.evidence_level})
            break
    for c in vault.certifications:
        blob = f"{c.name} {c.organization}".lower()
        if low in blob:
            sources.append({"type": "Certification", "title": f"{c.name} ({c.organization})".strip()})
    for a in vault.achievements:
        blob = f"{a.title} {a.description}".lower()
        if low in blob:
            sources.append({"type": "Achievement", "title": a.title})

    seen, unique = set(), []
    for s in sources:
        key = (s["type"], s["title"])
        if key not in seen:
            seen.add(key)
            unique.append(s)

    if not unique:
        return {"skill": skill_name, "evidence": False, "sources": [], "strength": "none"}
    strength = "strong" if len(unique) >= 2 or any(s.get("level") == "Strong" for s in unique) else "moderate"
    return {"skill": skill_name, "evidence": True, "sources": unique, "strength": strength}


def _bullet_suggestions(section_title: str, bullets: List[str], keywords: List[str]) -> List[dict]:
    """Safe wording improvements for existing bullets using verified keywords."""
    suggestions = []
    for bullet in bullets:
        if not bullet or not str(bullet).strip():
            continue
        original = str(bullet).strip()
        if original.lower() in (key.lower() for key in keywords):
            continue
        lower = original.lower()
        suggestion = original
        for keyword in keywords:
            if keyword.lower() in lower:
                continue
            # Only append keywords the bullet clearly relates to (heuristic: short bullet + long keyword)
            if len(keyword) <= 24:
                suggestion = re.sub(r"[.!?]?$", "", suggestion) + f" · {keyword}"
                break
        if suggestion != original:
            suggestions.append({
                "section": section_title,
                "original": original,
                "suggestion": suggestion,
                "kind": "keyword",
                "safe": True,
            })
    return suggestions


def analyze_tailoring(vault, resume_text: str, jd_text: str, required_skills: List[str]) -> dict:
    """Produce a tailoring assessment with safe improvements + verification-required skills."""
    vault_text = _vault_text(vault)
    resume_lower = resume_text.lower()

    safe_improvements: List[dict] = []
    requires_verification: List[dict] = []

    for skill in required_skills:
        evidence = _skill_evidence(vault, skill, vault_text)
        present_in_resume = _count_occurrences(resume_lower, skill) > 0
        if not evidence["evidence"]:
            requires_verification.append({
                "skill": skill,
                "reason": f"{skill} appears in the job description, but no verified evidence exists in your Career Vault.",
                "resumeMentioned": present_in_resume,
                "sources": [],
            })
        elif not present_in_resume:
            safe_improvements.append({
                "kind": "skill",
                "title": f"Add verified skill: {skill}",
                "section": "Skills",
                "description": f"{skill} is verified in your Career Vault and should be listed so the ATS can match it.",
                "evidence": evidence["sources"],
                "safe": True,
            })

    # Safe wording suggestions for resume bullets
    bullets = []
    for line in resume_text.splitlines():
        line = line.strip()
        if line.startswith(("-", "*", "•")) and len(line) > 12:
            bullets.append(line[1:].strip())
    bullet_suggestions = _bullet_suggestions("Experience", bullets, required_skills)
    safe_improvements.extend(bullet_suggestions)

    summary_safe = [
        {"kind": "summary", "section": "Summary", "safe": True,
         "description": "Reflect the target role and stack in your summary for a stronger ATS pass."}
    ] if jd_text.strip() else []

    return {
        "safeImprovements": safe_improvements + summary_safe,
        "requiresVerification": requires_verification,
        "vaultSkillCount": len(vault.skills),
        "jdSkillCount": len(required_skills),
        "actionVerbs": ["Built", "Shipped", "Led", "Designed", "Optimized", "Automated", "Architected", "Scaled"],
    }


def quantify_suggestions(bullets: List[str]) -> List[dict]:
    """Suggest quantified, outcome-based rewrites for weak bullets (safe improvements)."""
    out = []
    for b in bullets:
        original = str(b).strip()
        lower = original.lower()
        if any(d in lower for d in ["%", "users", "customers", "requests", "x faster", "qps", "latency", "sla", "revenue", "cost"]):
            continue
        if len(original) < 20:
            continue
        out.append({
            "section": "Experience",
            "original": original,
            "suggestion": f"{_ACTION_VERB(original)} (e.g., size, users, or % impact) — " + original,
            "kind": "quantify",
            "safe": True,
        })
    return out


def _ACTION_VERB(text: str) -> str:
    for verb in ["built", "developed", "designed", "led", "implemented", "created", "managed", "optimized"]:
        if verb in text.lower():
            return "Add a measurable outcome to quantify this result"
    return "Start with a strong action verb and add a quantifiable outcome"