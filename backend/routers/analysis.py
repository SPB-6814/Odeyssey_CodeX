"""
FastAPI router: POST /api/analyze
Orchestrates the full pipeline:
  scrape → classify → detect campaigns → aggregate → return JSON
"""
import logging
import os
from fastapi import APIRouter, HTTPException

from models.schemas import AnalyzeRequest, AnalyzeResponse, ProductDetails, ReviewsBreakdown
from scraper.scraper import scrape_product
from scraper.playwright_scraper import scrape_product_live
from engine.classifier import classify_reviews
from engine.campaign_detector import detect_campaigns
from engine.aggregator import (
    compute_adjusted_rating,
    build_timeline_data,
    build_cluster_data,
    extract_common_issues,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_product(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Full pipeline endpoint.
    Accepts a product URL, runs detection, returns structured JSON.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    logger.info(f"Starting analysis for: {url}")

    # ── Step 1: Scrape (live → mock fallback) ────────────────────────────────
    scraped = None
    try:
        scraped = scrape_product_live(url)
        logger.info("Live scraper succeeded")
    except Exception as e:
        logger.warning(f"Live scraper failed ({e})")

    if scraped is None or not scraped.get("reviews"):
        allow_random_mock = os.getenv("ALLOW_RANDOM_MOCK_FALLBACK", "false").lower() in {"1", "true", "yes"}
        if allow_random_mock:
            try:
                scraped = scrape_product(url)
                logger.info("Random mock scraper used as fallback")
            except Exception as e:
                logger.error(f"Mock scraper also failed: {e}")
                raise HTTPException(status_code=502, detail=f"Scraper error: {str(e)}")
        else:
            raise HTTPException(
                status_code=502,
                detail="Unable to scrape live reviews from the provided URL. Please verify the product link and try again.",
            )

    product_meta = scraped["product"]
    raw_reviews = scraped["reviews"]

    max_reviews = max(10, int(os.getenv("MAX_REVIEWS_TO_ANALYZE", "40")))
    if len(raw_reviews) > max_reviews:
        logger.info(f"Limiting reviews for analysis: {len(raw_reviews)} -> {max_reviews}")
        raw_reviews = raw_reviews[:max_reviews]

    logger.info(f"Scraped {len(raw_reviews)} reviews for '{product_meta['name']}'")

    # ── Step 2: Classify reviews (Gemini + heuristic fallback) ───────────────
    try:
        genuine_reviews, fake_reviews = classify_reviews(raw_reviews)
    except Exception as e:
        logger.error(f"Classifier failed: {e}")
        raise HTTPException(status_code=500, detail=f"Classifier error: {str(e)}")

    logger.info(f"Classified: {len(genuine_reviews)} genuine, {len(fake_reviews)} fake")

    # ── Step 3: Campaign detection ────────────────────────────────────────────
    campaign_info = detect_campaigns(fake_reviews)
    logger.info(f"Campaigns detected: {len(campaign_info['campaigns'])}")

    # ── Step 4: Aggregate ─────────────────────────────────────────────────────
    adjusted_rating = compute_adjusted_rating(genuine_reviews)
    timeline = build_timeline_data(genuine_reviews, fake_reviews)
    clusters = build_cluster_data(genuine_reviews)
    common_issues = extract_common_issues(genuine_reviews)

    # ── Step 5: Build response ────────────────────────────────────────────────
    response = AnalyzeResponse(
        product_details=ProductDetails(
            name=product_meta["name"],
            original_rating=round(product_meta["original_rating"], 1),
            adjusted_rating=adjusted_rating,
            category=product_meta.get("category"),
            total_reviews=product_meta["total_reviews"],
        ),
        reviews_breakdown=ReviewsBreakdown(
            genuine_reviews=genuine_reviews,
            fake_reviews=fake_reviews,
        ),
        timeline_graph_data=timeline,
        reviewer_cluster_data=clusters,
        common_issues=common_issues,
    )

    logger.info(f"Analysis complete for: {url}")
    return response
