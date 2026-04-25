"""
FastAPI Backend — Fake Review Detection System

Endpoints:
  POST /api/analyze   — Analyze a product's reviews
  GET  /api/news      — Get fake review news/trends
  GET  /api/health    — Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time
import hashlib
from scraper import scrape_reviews
from analyzer import ReviewAnalyzer
from mock_data import NEWS_DATA

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Fake Review Detection System",
    description="AI-powered review analysis engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton analyzer
analyzer = ReviewAnalyzer()

# Simple in-memory cache
_cache = {}
CACHE_TTL = 300  # 5 minutes


# ─── Request / Response Models ────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    query: str  # product URL or product name
    force_refresh: Optional[bool] = False


class HealthResponse(BaseModel):
    status: str
    version: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.post("/api/analyze")
def analyze_product(request: AnalyzeRequest):
    """
    Main analysis endpoint.
    Accepts a product URL or name, runs the full pipeline.
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Check cache
    cache_key = hashlib.md5(query.lower().encode()).hexdigest()
    if not request.force_refresh and cache_key in _cache:
        cached = _cache[cache_key]
        if time.time() - cached["timestamp"] < CACHE_TTL:
            return cached["result"]

    try:
        # Step 1: Scrape / fetch reviews
        reviews, product_info, source = scrape_reviews(query)

        # Step 2: Run analysis pipeline
        result = analyzer.analyze(reviews, product_info)

        # Step 3: Add metadata
        result["meta"] = {
            "query": query,
            "source": source,
            "analysis_timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "processing_time_ms": 0,  # will be set below
        }

        # Cache result
        _cache[cache_key] = {"result": result, "timestamp": time.time()}

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/news")
def get_news():
    """Return fake review news/trends data."""
    return {"news": NEWS_DATA}


# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
