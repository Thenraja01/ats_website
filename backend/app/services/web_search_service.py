"""Web search service for real-world interview trends, company question patterns, and aptitude rounds."""

import httpx
import re
from typing import List, Dict, Any
from urllib.parse import quote_plus
from app.utils.logger import get_logger

logger = get_logger(__name__)


def search_web_snippets(query: str, max_results: int = 5) -> List[Dict[str, str]]:
    """Search DuckDuckGo HTML for real interview question discussions and patterns."""
    url = f"https://html.duckduckgo.com/html/?q={quote_plus(query)}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    results = []
    try:
        with httpx.Client(timeout=8.0, follow_redirects=True) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                # Extract snippets using regex
                snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', resp.text, re.DOTALL)
                titles = re.findall(r'<a class="result__url[^>]*>(.*?)</a>', resp.text, re.DOTALL)

                for i, snip in enumerate(snippets[:max_results]):
                    clean_text = re.sub(r"<[^>]+>", "", snip).strip()
                    if clean_text:
                        results.append({
                            "title": titles[i] if i < len(titles) else "Interview Pattern",
                            "snippet": clean_text[:300]
                        })
    except Exception as e:
        logger.warning(f"DuckDuckGo search error: {e}. Using curated domain research.")

    return results


def research_interview_context(
    role: str,
    company: str = "",
    skills: List[str] = None,
) -> Dict[str, Any]:
    """Perform multi-angle research on target role and company hiring patterns."""
    skills = skills or []
    top_skills = ", ".join(skills[:4]) if skills else role

    company_query = f"{company} {role} interview questions technical coding" if company else f"{role} {top_skills} interview questions"
    aptitude_query = f"{company or 'tech'} software engineer aptitude reasoning assessment questions"

    tech_results = search_web_snippets(company_query, max_results=4)
    aptitude_results = search_web_snippets(aptitude_query, max_results=3)

    return {
        "role": role,
        "company": company or "Technology Industry Standard",
        "tech_trends": [r["snippet"] for r in tech_results] if tech_results else [
            f"Key expectations for {role}: Core architectural patterns, state management, asynchronous handling, system scalability, and live debugging."
        ],
        "aptitude_trends": [r["snippet"] for r in aptitude_results] if aptitude_results else [
            "Online assessment focuses on: algorithmic complexity (Big-O), quantitative problem solving, discrete math, and situational judgement."
        ]
    }
