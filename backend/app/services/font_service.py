"""Font metadata service with Google Fonts API integration and in-memory/file caching.

Architecture:
Your Backend -> Google Fonts API -> Font metadata (name, family, category, variants, subsets) -> Backend Cache
"""

import os
import time
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Cache configuration
_FONT_CACHE: Dict[str, Any] = {
    "data": [],
    "last_fetched": 0,
    "ttl_seconds": 24 * 3600  # 24 hours
}

# Rich curated font catalog (used immediately and as authoritative baseline)
BASE_GOOGLE_FONTS_CATALOG = [
    # ── SANS-SERIF (MODERN & ATS OPTIMIZED) ──
    {
        "id": "poppins",
        "name": "Poppins",
        "family": "'Poppins', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Poppins",
        "variants": ["300", "400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "devanagari"],
        "atsScore": 98,
        "popularity": 1
    },
    {
        "id": "inter",
        "name": "Inter",
        "family": "'Inter', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Inter",
        "variants": ["300", "400", "500", "600", "700", "800", "900"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek"],
        "atsScore": 99,
        "isDefault": True,
        "popularity": 2
    },
    {
        "id": "roboto",
        "name": "Roboto",
        "family": "'Roboto', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Roboto",
        "variants": ["300", "400", "500", "700", "900"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek"],
        "atsScore": 98,
        "popularity": 3
    },
    {
        "id": "open-sans",
        "name": "Open Sans",
        "family": "'Open Sans', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Open Sans",
        "variants": ["300", "400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek", "hebrew"],
        "atsScore": 98,
        "popularity": 4
    },
    {
        "id": "lato",
        "name": "Lato",
        "family": "'Lato', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Lato",
        "variants": ["300", "400", "700", "900"],
        "subsets": ["latin", "latin-ext"],
        "atsScore": 97,
        "popularity": 5
    },
    {
        "id": "montserrat",
        "name": "Montserrat",
        "family": "'Montserrat', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Montserrat",
        "variants": ["300", "400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 96,
        "popularity": 6
    },
    {
        "id": "plus-jakarta-sans",
        "name": "Plus Jakarta Sans",
        "family": "'Plus Jakarta Sans', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Plus Jakarta Sans",
        "variants": ["400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext"],
        "atsScore": 98,
        "popularity": 7
    },
    {
        "id": "outfit",
        "name": "Outfit",
        "family": "'Outfit', sans-serif",
        "category": "sans-serif",
        "googleFontName": "Outfit",
        "variants": ["300", "400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext"],
        "atsScore": 97,
        "popularity": 8
    },
    {
        "id": "calibri",
        "name": "Calibri",
        "family": "Calibri, 'Segoe UI', sans-serif",
        "category": "sans-serif",
        "googleFontName": None,
        "variants": ["400", "700"],
        "subsets": ["latin"],
        "atsScore": 99,
        "popularity": 9
    },
    {
        "id": "arial",
        "name": "Arial",
        "family": "Arial, sans-serif",
        "category": "sans-serif",
        "googleFontName": None,
        "variants": ["400", "700"],
        "subsets": ["latin"],
        "atsScore": 99,
        "popularity": 10
    },

    # ── SERIF (EXECUTIVE, ACADEMIC & LEGAL) ──
    {
        "id": "playfair-display",
        "name": "Playfair Display",
        "family": "'Playfair Display', Georgia, serif",
        "category": "serif",
        "googleFontName": "Playfair Display",
        "variants": ["400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 95,
        "popularity": 11
    },
    {
        "id": "merriweather",
        "name": "Merriweather",
        "family": "'Merriweather', Georgia, serif",
        "category": "serif",
        "googleFontName": "Merriweather",
        "variants": ["300", "400", "700", "900"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 99,
        "popularity": 12
    },
    {
        "id": "lora",
        "name": "Lora",
        "family": "'Lora', Georgia, serif",
        "category": "serif",
        "googleFontName": "Lora",
        "variants": ["400", "500", "600", "700"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 97,
        "popularity": 13
    },
    {
        "id": "eb-garamond",
        "name": "EB Garamond",
        "family": "'EB Garamond', Georgia, serif",
        "category": "serif",
        "googleFontName": "EB Garamond",
        "variants": ["400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek"],
        "atsScore": 96,
        "popularity": 14
    },
    {
        "id": "georgia",
        "name": "Georgia",
        "family": "Georgia, serif",
        "category": "serif",
        "googleFontName": None,
        "variants": ["400", "700"],
        "subsets": ["latin"],
        "atsScore": 99,
        "popularity": 15
    },
    {
        "id": "times",
        "name": "Times New Roman",
        "family": "'Times New Roman', Times, serif",
        "category": "serif",
        "googleFontName": None,
        "variants": ["400", "700"],
        "subsets": ["latin"],
        "atsScore": 99,
        "popularity": 16
    },

    # ── HANDWRITING / SCRIPT ──
    {
        "id": "pacifico",
        "name": "Pacifico",
        "family": "'Pacifico', cursive",
        "category": "handwriting",
        "googleFontName": "Pacifico",
        "variants": ["400"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 80,
        "popularity": 17
    },
    {
        "id": "caveat",
        "name": "Caveat",
        "family": "'Caveat', cursive",
        "category": "handwriting",
        "googleFontName": "Caveat",
        "variants": ["400", "500", "600", "700"],
        "subsets": ["latin", "latin-ext", "cyrillic"],
        "atsScore": 82,
        "popularity": 18
    },
    {
        "id": "dancing-script",
        "name": "Dancing Script",
        "family": "'Dancing Script', cursive",
        "category": "handwriting",
        "googleFontName": "Dancing Script",
        "variants": ["400", "500", "600", "700"],
        "subsets": ["latin", "latin-ext"],
        "atsScore": 80,
        "popularity": 19
    },

    # ── MONOSPACE & CODE ──
    {
        "id": "jetbrains",
        "name": "JetBrains Mono",
        "family": "'JetBrains Mono', monospace",
        "category": "monospace",
        "googleFontName": "JetBrains Mono",
        "variants": ["300", "400", "500", "600", "700", "800"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek"],
        "atsScore": 98,
        "popularity": 20
    },
    {
        "id": "fira-code",
        "name": "Fira Code",
        "family": "'Fira Code', monospace",
        "category": "monospace",
        "googleFontName": "Fira Code",
        "variants": ["300", "400", "500", "600", "700"],
        "subsets": ["latin", "latin-ext", "cyrillic", "greek"],
        "atsScore": 97,
        "popularity": 21
    },
    {
        "id": "space-grotesk",
        "name": "Space Grotesk",
        "family": "'Space Grotesk', sans-serif",
        "category": "monospace",
        "googleFontName": "Space Grotesk",
        "variants": ["300", "400", "500", "600", "700"],
        "subsets": ["latin", "latin-ext"],
        "atsScore": 96,
        "popularity": 22
    }
]


async def fetch_google_fonts_metadata(
    api_key: Optional[str] = None,
    sort: str = "popularity"
) -> List[Dict[str, Any]]:
    """Fetch live font metadata from Google Fonts Web Fonts API or use cached list."""
    now = time.time()
    
    # Check cache freshness
    if _FONT_CACHE["data"] and (now - _FONT_CACHE["last_fetched"]) < _FONT_CACHE["ttl_seconds"]:
        return _FONT_CACHE["data"]

    google_api_key = api_key or os.getenv("GOOGLE_FONTS_API_KEY") or getattr(settings, "GOOGLE_API_KEY", "")

    if google_api_key:
        try:
            url = f"https://www.googleapis.com/webfonts/v1/webfonts?key={google_api_key}&sort={sort}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    transformed_fonts = []

                    for idx, item in enumerate(items[:60]):  # Top 60 most popular
                        raw_name = item.get("family", "")
                        font_id = raw_name.lower().replace(" ", "-")
                        cat = item.get("category", "sans-serif")
                        
                        # Map Google category to standard category
                        std_cat = "sans-serif"
                        if "serif" in cat and "sans" not in cat:
                            std_cat = "serif"
                        elif "handwriting" in cat:
                            std_cat = "handwriting"
                        elif "monospace" in cat:
                            std_cat = "monospace"
                        elif "display" in cat:
                            std_cat = "sans-serif"

                        family_css = f"'{raw_name}', {std_cat}" if std_cat != "monospace" else f"'{raw_name}', monospace"

                        transformed_fonts.append({
                            "id": font_id,
                            "name": raw_name,
                            "family": family_css,
                            "category": std_cat,
                            "googleFontName": raw_name,
                            "variants": item.get("variants", ["regular", "700"]),
                            "subsets": item.get("subsets", ["latin"]),
                            "atsScore": 98 if std_cat in ["sans-serif", "serif", "monospace"] else 80,
                            "popularity": idx + 1
                        })

                    if transformed_fonts:
                        _FONT_CACHE["data"] = transformed_fonts
                        _FONT_CACHE["last_fetched"] = now
                        logger.info(f"Loaded {len(transformed_fonts)} fonts from Google Fonts API")
                        return transformed_fonts

        except Exception as e:
            logger.warn(f"Failed to fetch live Google Fonts API, falling back to cached catalog: {e}")

    # Fallback to rich curated catalog
    _FONT_CACHE["data"] = BASE_GOOGLE_FONTS_CATALOG
    _FONT_CACHE["last_fetched"] = now
    return BASE_GOOGLE_FONTS_CATALOG


async def get_filtered_fonts(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "popularity",
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """Retrieve filtered, sorted, and paginated font metadata."""
    fonts = await fetch_google_fonts_metadata(sort=sort)

    # Filter by category
    if category and category.lower() != "all":
        cat_lower = category.lower().strip()
        fonts = [f for f in fonts if f.get("category", "").lower() == cat_lower]

    # Filter by search query
    if search and search.strip():
        q = search.lower().strip()
        fonts = [f for f in fonts if q in f.get("name", "").lower() or q in f.get("id", "").lower()]

    total = len(fonts)
    paginated = fonts[offset : offset + limit]

    return {
        "fonts": paginated,
        "total": total,
        "limit": limit,
        "offset": offset,
        "categories": ["sans-serif", "serif", "handwriting", "monospace"]
    }
