"""
Pydantic schemas for the Fake Review Detector API.
Defines request/response models matching the frontend data contract exactly.
"""
from pydantic import BaseModel
from typing import List, Optional


# ─── Request ────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str


# ─── Sub-models ─────────────────────────────────────────────────────────────

class RawReview(BaseModel):
    """Internal model — output of the scraper, input of the classifier."""
    reviewer_id: str
    reviewer: str
    rating: float
    text: str
    date: str   # ISO format "YYYY-MM-DD"


class GenuineReview(BaseModel):
    reviewer: str
    rating: float
    text: str
    date: str


class FakeReview(BaseModel):
    reviewer: str
    rating: float
    text: str
    date: str
    flag_reason: str


class ReviewsBreakdown(BaseModel):
    genuine_reviews: List[GenuineReview]
    fake_reviews: List[FakeReview]


class ProductDetails(BaseModel):
    name: str
    original_rating: float
    adjusted_rating: float
    category: Optional[str] = None
    total_reviews: int


class TimelineDataPoint(BaseModel):
    date: str          # e.g. "Jan 2024" — label for Chart.js X axis
    review_count: int
    avg_rating: float
    sentiment: str     # "positive" | "negative" | "neutral"


class ReviewerClusterPoint(BaseModel):
    cluster_id: int
    cluster_name: str
    percentage: float  # % of total reviewers in cluster (for bar chart)
    color: str         # hex color for the bar
    reviewer_name: str
    trust_score: float
    x_coordinate: float
    y_coordinate: float


class CommonIssue(BaseModel):
    issue: str
    count: int
    severity: str  # "high" | "medium" | "low"


# ─── Top-level Response ─────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    product_details: ProductDetails
    reviews_breakdown: ReviewsBreakdown
    timeline_graph_data: List[TimelineDataPoint]
    reviewer_cluster_data: List[ReviewerClusterPoint]
    common_issues: List[CommonIssue]
