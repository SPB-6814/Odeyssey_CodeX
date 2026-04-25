"""
FastAPI Backend — Fake Review Detection System

Endpoints:
  POST /api/analyze   — Analyze a product's reviews
  GET  /api/news      — Get fake review news/trends
  GET  /api/health    — Health check
"""

import time
import hashlib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scraper import scrape_reviews
from analyzer import ReviewAnalyzer
from mock_data import NEWS_DATA

# ─── App Setup ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="Fake Review Detection System",
    description="AI-powered review analysis engine — Odyssey CodeX Hackathon",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = ReviewAnalyzer()

# Simple in-memory cache (5 min TTL)
_cache: dict = {}
CACHE_TTL = 300


# ─── Models ──────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    query: str
    force_refresh: Optional[bool] = False


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "version": "2.0.0", "engine": "ReviewGuard NLP/ML"}


@app.post("/api/analyze")
def analyze_product(request: AnalyzeRequest):
    """
    Main analysis endpoint.
    Steps: Scrape → NLP → Similarity → Behavioral → Trust Score → Cluster → Issues
    """
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Cache check
    cache_key = hashlib.md5(query.lower().encode()).hexdigest()
    if not request.force_refresh and cache_key in _cache:
        cached = _cache[cache_key]
        if time.time() - cached["timestamp"] < CACHE_TTL:
            return cached["result"]

    start_ms = int(time.time() * 1000)

    try:
        reviews, product_info, source = scrape_reviews(query)
        result = analyzer.analyze(reviews, product_info)
        result["meta"] = {
            "query": query,
            "source": source,
            "analysis_timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "processing_time_ms": int(time.time() * 1000) - start_ms,
        }
        _cache[cache_key] = {"result": result, "timestamp": time.time()}
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/api/news")
def get_news():
    """Return fake review news and platform intelligence."""
    return {"news": NEWS_DATA}


@app.get("/api/cache/clear")
def clear_cache():
    """Clear the analysis cache."""
    _cache.clear()
    return {"message": "Cache cleared"}
