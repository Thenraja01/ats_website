"""HireMind AI Backend — FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.auth_router import auth_router
from app.api.user_router import user_router
from app.api.resume_router import resume_router
from app.api.rag_router import rag_router
from app.schemas.response_schema import HealthResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup/shutdown lifecycle."""
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="HireMind AI — Intelligent Applicant Tracking System with LLM-powered resume analysis",
    version=settings.VERSION,
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)


# ── Root & Health ────────────────────────────────
@app.get("/")
def read_root():
    """Root welcome endpoint."""
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}


@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint."""
    return HealthResponse(version=settings.VERSION)
