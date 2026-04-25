"""
FastAPI application entry point.
Configure CORS, mount routers, and start the server.
"""
import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.analysis import router as analysis_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

app = FastAPI(
    title="Fake Review Detector API",
    description="AI-powered review authenticity analysis using Gemini, KMeans, and TF-IDF.",
    version="1.0.0",
)

default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

env_origins = [
    origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "").split(",") if origin.strip()
]

allowed_origins = list(dict.fromkeys(default_origins + env_origins))

# ─── CORS — allow Next.js dev server ─────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(analysis_router)


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "fake-review-detector"}
