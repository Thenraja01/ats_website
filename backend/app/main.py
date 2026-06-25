from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import routers
from .api.auth_router import auth_router
from .api.candidate_routes import candidate_router
from .api.recruiter_routes import recruiter_router
from .api.user_router import user_router
from contextlib import asynccontextmanager
from app.core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="FastAPI Skeleton",
    description="A simple FastAPI application skeleton",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(candidate_router, prefix="/api/v1")
app.include_router(recruiter_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(routers.api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to the HireMind AI application"}
