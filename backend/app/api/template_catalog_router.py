"""API Router for dynamic, code-free Resume Template catalog & private templates."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional, List
import re

from app.models.template_model import ResumeTemplate
from app.models.user_model import User
from app.schemas.template_schema import (
    TemplateCreatePayload,
    TemplateResponse,
    TemplateListResponse,
)
from app.dependencies.auth_dependency import (
    get_current_user,
    get_optional_current_user,
)

template_catalog_router = APIRouter(prefix="/templates", tags=["Template Catalog"])

DEFAULT_TEMPLATES_SEED = [
    {
        "slug": "modern-tech",
        "title": "Modern Tech",
        "description": "High-impact single-column layout optimized for software engineers and tech leaders. 100% ATS compliant.",
        "category": "tech",
        "tags": ["Software Engineering", "Clean", "ATS Friendly", "Popular"],
        "visibility": "public",
        "ats_score_rating": 98,
        "is_premium": False,
        "typography": {
            "fontFamily": "Inter, sans-serif",
            "headingFont": "Space Grotesk, sans-serif",
            "baseSizePt": 10.5,
            "scaleRatio": 1.25,
            "lineHeight": 1.45,
        },
        "palette": {
            "primary": "#2563EB",
            "secondary": "#3B82F6",
            "textPrimary": "#0F172A",
            "textMuted": "#64748B",
            "surface": "#FFFFFF",
            "borderColor": "#E2E8F0",
        },
        "layout": {
            "schemaVersion": "1.0.0",
            "layoutType": "single_column",
            "pageMarginPx": 32,
            "sectionGapPx": 18,
            "itemGapPx": 10,
            "borderRadiusPx": 6,
            "bulletStyle": "disc",
            "headerAlign": "left",
            "atsSafe": True,
            "zones": [
                {
                    "id": "header",
                    "widthPct": 100,
                    "sections": ["personal"],
                    "paddingPx": 12,
                },
                {
                    "id": "main",
                    "widthPct": 100,
                    "sections": ["summary", "skills", "experience", "projects", "education", "certifications"],
                    "paddingPx": 12,
                },
            ],
        },
    },
    {
        "slug": "executive-split",
        "title": "Executive Split",
        "description": "Sophisticated two-column asymmetric layout with quick-scan skills and contact sidebar for leadership roles.",
        "category": "executive",
        "tags": ["Executive", "Management", "Two Column", "Polished"],
        "visibility": "public",
        "ats_score_rating": 94,
        "is_premium": False,
        "typography": {
            "fontFamily": "Inter, sans-serif",
            "headingFont": "Inter, sans-serif",
            "baseSizePt": 10.0,
            "scaleRatio": 1.2,
            "lineHeight": 1.4,
        },
        "palette": {
            "primary": "#0F766E",
            "secondary": "#14B8A6",
            "textPrimary": "#134E4A",
            "textMuted": "#64748B",
            "surface": "#FFFFFF",
            "borderColor": "#CCFBF1",
        },
        "layout": {
            "schemaVersion": "1.0.0",
            "layoutType": "two_column_left_sidebar",
            "columnRatio": "32/68",
            "pageMarginPx": 28,
            "sectionGapPx": 16,
            "itemGapPx": 8,
            "borderRadiusPx": 8,
            "bulletStyle": "disc",
            "headerAlign": "left",
            "atsSafe": True,
            "zones": [
                {
                    "id": "header",
                    "widthPct": 100,
                    "sections": ["personal"],
                    "paddingPx": 14,
                },
                {
                    "id": "sidebar",
                    "widthPct": 32,
                    "sections": ["skills", "education", "certifications"],
                    "backgroundColor": "#F0FDFA",
                    "paddingPx": 16,
                },
                {
                    "id": "main",
                    "widthPct": 68,
                    "sections": ["summary", "experience", "projects"],
                    "paddingPx": 16,
                },
            ],
        },
    },
    {
        "slug": "minimal-ats",
        "title": "Minimalist ATS Guard",
        "description": "Ultra-clean monochrome typography designed specifically to guarantee perfect scoring through any parser.",
        "category": "minimal_ats",
        "tags": ["Monochrome", "Maximum ATS", "Classic", "Universal"],
        "visibility": "public",
        "ats_score_rating": 100,
        "is_premium": False,
        "typography": {
            "fontFamily": "Inter, sans-serif",
            "headingFont": "Inter, sans-serif",
            "baseSizePt": 10.0,
            "scaleRatio": 1.2,
            "lineHeight": 1.5,
        },
        "palette": {
            "primary": "#18181B",
            "secondary": "#3F3F46",
            "textPrimary": "#18181B",
            "textMuted": "#71717A",
            "surface": "#FFFFFF",
            "borderColor": "#E4E4E7",
        },
        "layout": {
            "schemaVersion": "1.0.0",
            "layoutType": "single_column",
            "pageMarginPx": 36,
            "sectionGapPx": 16,
            "itemGapPx": 8,
            "borderRadiusPx": 0,
            "bulletStyle": "disc",
            "headerAlign": "center",
            "atsSafe": True,
            "zones": [
                {
                    "id": "header",
                    "widthPct": 100,
                    "sections": ["personal"],
                    "paddingPx": 8,
                },
                {
                    "id": "main",
                    "widthPct": 100,
                    "sections": ["summary", "experience", "education", "skills", "projects", "certifications"],
                    "paddingPx": 8,
                },
            ],
        },
    },
    {
        "slug": "creative-accent",
        "title": "Creative Spectrum",
        "description": "Vibrant violet and indigo accents crafted for designers, product managers, and modern creators.",
        "category": "creative",
        "tags": ["Design", "Product", "Vibrant", "Modern"],
        "visibility": "public",
        "ats_score_rating": 92,
        "is_premium": False,
        "typography": {
            "fontFamily": "Inter, sans-serif",
            "headingFont": "Space Grotesk, sans-serif",
            "baseSizePt": 10.5,
            "scaleRatio": 1.25,
            "lineHeight": 1.45,
        },
        "palette": {
            "primary": "#7C3AED",
            "secondary": "#6366F1",
            "textPrimary": "#1E1B4B",
            "textMuted": "#6B7280",
            "surface": "#FFFFFF",
            "borderColor": "#EDE9FE",
        },
        "layout": {
            "schemaVersion": "1.0.0",
            "layoutType": "two_column_right_sidebar",
            "columnRatio": "68/32",
            "pageMarginPx": 28,
            "sectionGapPx": 16,
            "itemGapPx": 10,
            "borderRadiusPx": 8,
            "bulletStyle": "square",
            "headerAlign": "left",
            "atsSafe": True,
            "zones": [
                {
                    "id": "header",
                    "widthPct": 100,
                    "sections": ["personal"],
                    "paddingPx": 14,
                },
                {
                    "id": "main",
                    "widthPct": 68,
                    "sections": ["summary", "experience", "projects"],
                    "paddingPx": 16,
                },
                {
                    "id": "sidebar",
                    "widthPct": 32,
                    "sections": ["skills", "education", "certifications"],
                    "backgroundColor": "#F5F3FF",
                    "paddingPx": 16,
                },
            ],
        },
    },
    {
        "slug": "compact-developer",
        "title": "Compact Developer",
        "description": "High-density structure that packs extensive project history and technical proficiencies into a clean single page.",
        "category": "tech",
        "tags": ["High Density", "Tech Stack", "Single Page"],
        "visibility": "public",
        "ats_score_rating": 97,
        "is_premium": False,
        "typography": {
            "fontFamily": "Inter, sans-serif",
            "headingFont": "Space Grotesk, sans-serif",
            "baseSizePt": 9.5,
            "scaleRatio": 1.18,
            "lineHeight": 1.35,
        },
        "palette": {
            "primary": "#0284C7",
            "secondary": "#0369A1",
            "textPrimary": "#0C4A6E",
            "textMuted": "#64748B",
            "surface": "#FFFFFF",
            "borderColor": "#E0F2FE",
        },
        "layout": {
            "schemaVersion": "1.0.0",
            "layoutType": "single_column",
            "pageMarginPx": 24,
            "sectionGapPx": 12,
            "itemGapPx": 6,
            "borderRadiusPx": 4,
            "bulletStyle": "disc",
            "headerAlign": "left",
            "atsSafe": True,
            "zones": [
                {
                    "id": "header",
                    "widthPct": 100,
                    "sections": ["personal"],
                    "paddingPx": 10,
                },
                {
                    "id": "main",
                    "widthPct": 100,
                    "sections": ["skills", "summary", "experience", "projects", "education"],
                    "paddingPx": 10,
                },
            ],
        },
    },
]


async def ensure_seed_templates():
    """Populate default templates if none exist."""
    count = await ResumeTemplate.count()
    if count == 0:
        for tpl_data in DEFAULT_TEMPLATES_SEED:
            template = ResumeTemplate(**tpl_data)
            await template.insert()


@template_catalog_router.get("", response_model=TemplateListResponse)
async def list_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search term for title or tags"),
    scope: str = Query("all", description="Scope: 'all', 'public', or 'private'"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """List resume templates with visibility isolation (public catalog vs user's private templates)."""
    await ensure_seed_templates()

    user_id = str(current_user.id) if current_user else None

    # Base query conditions
    query_conditions = []

    # Visibility scoping:
    # - If scope == "private": must be authenticated and author_id == user_id
    # - If scope == "public": visibility == "public"
    # - If scope == "all": public OR (authenticated user's private)
    if scope == "private":
        if not user_id:
            return TemplateListResponse(
                templates=[],
                total=0,
                page=page,
                limit=limit,
                categories=[],
            )
        query_conditions.append({"author_id": user_id, "visibility": "private"})
    elif scope == "public":
        query_conditions.append({"visibility": "public"})
    else:  # all
        if user_id:
            query_conditions.append({
                "$or": [
                    {"visibility": "public"},
                    {"author_id": user_id},
                ]
            })
        else:
            query_conditions.append({"visibility": "public"})

    if category and category != "all":
        query_conditions.append({"category": category})

    if search:
        search_regex = re.compile(re.escape(search), re.IGNORECASE)
        query_conditions.append({
            "$or": [
                {"title": {"$regex": search_regex}},
                {"description": {"$regex": search_regex}},
                {"tags": {"$regex": search_regex}},
            ]
        })

    mongo_query = {"$and": query_conditions} if query_conditions else {}

    skip = (page - 1) * limit
    templates_cursor = ResumeTemplate.find(mongo_query).sort("-created_at").skip(skip).limit(limit)
    templates = await templates_cursor.to_list()
    total = await ResumeTemplate.find(mongo_query).count()

    # Collect available distinct categories
    all_categories = await ResumeTemplate.distinct("category")

    serialized = [
        TemplateResponse(**tpl.to_api_dict(current_user_id=user_id))
        for tpl in templates
    ]

    return TemplateListResponse(
        templates=serialized,
        total=total,
        page=page,
        limit=limit,
        categories=all_categories,
    )


@template_catalog_router.get("/{slug}", response_model=TemplateResponse)
async def get_template_by_slug(
    slug: str,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Retrieve full layout AST specification for a template by slug."""
    template = await ResumeTemplate.find_one(ResumeTemplate.slug == slug)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{slug}' was not found in catalog.",
        )

    user_id = str(current_user.id) if current_user else None

    # Check private access restriction
    if template.visibility == "private":
        if not user_id or template.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This is a private template accessible only by its author.",
            )

    # Increment usage counter safely
    template.usage_count = (template.usage_count or 0) + 1
    await template.save()

    return TemplateResponse(**template.to_api_dict(current_user_id=user_id))


@template_catalog_router.post("/publish", response_model=TemplateResponse)
async def publish_template(
    payload: TemplateCreatePayload,
    current_user: User = Depends(get_current_user),
):
    """Publish or save a custom template. Supports private mode (accessible only to author)."""
    user_id = str(current_user.id)

    # Check if slug exists
    existing = await ResumeTemplate.find_one(ResumeTemplate.slug == payload.slug)

    if existing:
        # If exists, verify ownership before overwrite
        if existing.author_id and existing.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="A template with this slug already exists and belongs to another creator.",
            )
        # Update existing
        existing.title = payload.title
        existing.description = payload.description
        existing.category = payload.category
        existing.tags = payload.tags
        existing.visibility = payload.visibility
        existing.typography = payload.typography.model_dump(by_alias=True)
        existing.palette = payload.palette.model_dump(by_alias=True)
        existing.layout = payload.layout.model_dump(by_alias=True)
        existing.author_id = user_id
        await existing.save()
        return TemplateResponse(**existing.to_api_dict(current_user_id=user_id))

    # Create new template
    new_template = ResumeTemplate(
        slug=payload.slug,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        tags=payload.tags,
        visibility=payload.visibility,
        author_id=user_id,
        is_premium=payload.is_premium,
        ats_score_rating=payload.ats_score_rating,
        thumbnail_url=payload.thumbnail_url,
        preview_url=payload.preview_url,
        typography=payload.typography.model_dump(by_alias=True),
        palette=payload.palette.model_dump(by_alias=True),
        layout=payload.layout.model_dump(by_alias=True),
    )
    await new_template.insert()

    return TemplateResponse(**new_template.to_api_dict(current_user_id=user_id))


@template_catalog_router.delete("/{slug}")
async def delete_template(
    slug: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a custom/private template created by the authenticated user."""
    template = await ResumeTemplate.find_one(ResumeTemplate.slug == slug)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Template '{slug}' not found.",
        )

    user_id = str(current_user.id)
    if template.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete templates that you have authored.",
        )

    await template.delete()
    return {"message": f"Template '{slug}' has been removed successfully."}


@template_catalog_router.post("/seed")
async def seed_templates(
    force: bool = Query(False, description="Force re-seed default templates"),
    current_user: User = Depends(get_current_user),
):
    """Seed or restore baseline professional templates."""
    if force:
        for tpl_data in DEFAULT_TEMPLATES_SEED:
            existing = await ResumeTemplate.find_one(ResumeTemplate.slug == tpl_data["slug"])
            if not existing:
                await ResumeTemplate(**tpl_data).insert()
    else:
        await ensure_seed_templates()

    return {"message": "Template catalog seeded successfully."}
