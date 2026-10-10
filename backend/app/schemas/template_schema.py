"""Pydantic schema definitions for dynamic, code-free Resume Templates."""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Dict, Any


def to_camel(string: str) -> str:
    parts = string.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class TypographySpec(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    font_family: str = "inter"
    heading_font: Optional[str] = "space-grotesk"
    base_size_pt: float = 10.5
    scale_ratio: float = 1.25
    line_height: float = 1.45


class ColorPaletteSpec(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    primary: str = "#2563EB"
    secondary: Optional[str] = "#4F46E5"
    text_primary: str = "#0F172A"
    text_muted: str = "#64748B"
    surface: str = "#FFFFFF"
    accent_bar: Optional[str] = None
    border_color: str = "#E2E8F0"


class ZoneSpec(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    id: str  # "header" | "sidebar" | "main" | "footer"
    width_pct: Optional[float] = 100.0
    sections: List[str]  # ["personal", "summary", "experience", ...]
    background_color: Optional[str] = None
    padding_px: int = 16


class LayoutAstSpec(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    schema_version: str = "1.0.0"
    layout_type: Literal[
        "single_column",
        "two_column_left_sidebar",
        "two_column_right_sidebar",
        "executive_split",
        "compact_tech",
    ] = "single_column"
    column_ratio: Optional[str] = "30/70"
    page_margin_px: int = 32
    section_gap_px: int = 16
    item_gap_px: int = 8
    border_radius_px: int = 6
    bullet_style: Literal["disc", "square", "dash", "none"] = "disc"
    header_align: Literal["left", "center", "right"] = "left"
    zones: List[ZoneSpec] = []
    ats_safe: bool = True


class TemplateCreatePayload(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    slug: str = Field(..., pattern=r"^[a-z0-9-]+$")
    title: str
    description: str
    category: Literal[
        "tech",
        "executive",
        "minimal_ats",
        "creative",
        "academic",
        "finance",
        "general",
    ] = "general"
    tags: List[str] = []
    visibility: Literal["public", "private"] = "public"
    is_premium: bool = False
    ats_score_rating: int = 95
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    typography: TypographySpec = Field(default_factory=TypographySpec)
    palette: ColorPaletteSpec = Field(default_factory=ColorPaletteSpec)
    layout: LayoutAstSpec = Field(default_factory=LayoutAstSpec)


class TemplateResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    id: str
    slug: str
    title: str
    description: str
    category: str
    tags: List[str] = []
    visibility: str = "public"
    author_id: Optional[str] = None
    is_owner: bool = False
    is_premium: bool = False
    ats_score_rating: int = 95
    thumbnail_url: Optional[str] = None
    preview_url: Optional[str] = None
    typography: Dict[str, Any]
    palette: Dict[str, Any]
    layout: Dict[str, Any]
    usage_count: int = 0
    created_at: str
    updated_at: str


class TemplateListResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, extra="ignore")

    templates: List[TemplateResponse]
    total: int
    page: int
    limit: int
    categories: List[str]
