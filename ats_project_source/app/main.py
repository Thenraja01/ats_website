"""FastAPI application initialization."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.security import security_config
from app.routes import health_routes, resume_routes, ats_routes, auth_routes, admin_routes
from app.utils.logger import get_logger
from app.websocket.socketio_app import socket_app

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""

    # Initialize FastAPI app
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="FastAPI backend for ATS resume analysis with AI scoring",
        version=settings.VERSION,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=security_config.CORS_ALLOW_CREDENTIALS,
        allow_methods=security_config.CORS_ALLOW_METHODS,
        allow_headers=security_config.CORS_ALLOW_HEADERS,
    )

    # Include routers
    app.include_router(health_routes.router)
    app.include_router(resume_routes.router)
    app.include_router(ats_routes.router)
    app.include_router(auth_routes.router)
    app.include_router(admin_routes.router)

    # Mount Socket.IO app
    app.mount("/socket.io", socket_app)

    # Startup event
    @app.on_event("startup")
    async def startup_event():
        """Run on application startup."""
        logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
        settings.setup_directories()

    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        """Run on application shutdown."""
        logger.info("Shutting down application")

    logger.info("FastAPI application initialized successfully")
    return app


# Create app instance
app = create_app()
