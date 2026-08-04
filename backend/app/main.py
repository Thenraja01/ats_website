"""HireMind AI Backend — FastAPI application factory."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api.auth_router import auth_router
from app.api.otp_router import otp_router
from app.api.user_router import user_router
from app.api.resume_router import resume_router
from app.api.rag_router import rag_router
from app.api.candidate_routes import candidate_router
from app.api.recruiter_routes import recruiter_router
from app.api.admin_router import admin_router
from app.api.public_router import public_router
from app.api.ws_router import ws_router
from app.schemas.response_schema import HealthResponse


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add HTTP security headers to every response."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
        return response


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

# ── Security Headers ──────────────────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)

# ── Trusted Host ──────────────────────────────────────────────────
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.hiremind.ai"],
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
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
    ],
)

# ── Routers ──────────────────────────────────────
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(otp_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)
app.include_router(rag_router, prefix=settings.API_V1_STR)
app.include_router(candidate_router, prefix=settings.API_V1_STR)
app.include_router(recruiter_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(public_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)


# ── Root & Health ────────────────────────────────
@app.get("/")
def read_root():
    """Root welcome endpoint."""
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}


@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint."""
    return HealthResponse(version=settings.VERSION)
