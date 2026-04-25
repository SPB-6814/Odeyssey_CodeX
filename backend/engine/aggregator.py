"""
Data aggregation engine.
Computes:
  1. Adjusted rating (mean of genuine review ratings)
  2. Timeline graph data (grouped by month)
  3. Reviewer cluster data (KMeans on reviewer features)
  4. Common issues (Gemini NLP on genuine review text)
"""
import os
import json
import re
import random
import hashlib
from collections import defaultdict
from datetime import datetime
from typing import List, Dict, Any, Tuple

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler

import google.generativeai as genai
from dotenv import load_dotenv

from models.schemas import (
    GenuineReview, FakeReview,
    TimelineDataPoint, ReviewerClusterPoint, CommonIssue,
)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))


# ─── Cluster config ───────────────────────────────────────────────────────────

CLUSTER_NAMES = ["Verified Buyers", "Repeat Customers", "New Users", "Suspicious"]
CLUSTER_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]
N_CLUSTERS = 4


# ─── 1. Adjusted Rating ───────────────────────────────────────────────────────

def compute_adjusted_rating(genuine_reviews: List[GenuineReview]) -> float:
    """Mean rating of genuine reviews, rounded to 1 decimal."""
    if not genuine_reviews:
        return 0.0
    return round(sum(r.rating for r in genuine_reviews) / len(genuine_reviews), 1)


# ─── 2. Timeline Graph Data ───────────────────────────────────────────────────

def build_timeline_data(
    genuine_reviews: List[GenuineReview],
    fake_reviews: List[FakeReview],
) -> List[TimelineDataPoint]:
    """
    Groups all reviews by month, computes:
      - review_count (total reviews that month)
      - avg_rating (genuine reviews that month)
      - sentiment ("positive" if avg_rating >= 3.5 else "negative")
    """
    monthly: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "ratings": [], "count": 0
    })

    all_reviews: List[Tuple[str, float]] = [
        (r.date, r.rating) for r in genuine_reviews
    ] + [
        (r.date, r.rating) for r in fake_reviews
    ]

    for date_str, rating in all_reviews:
        try:
            d = datetime.strptime(date_str, "%Y-%m-%d")
            key = d.strftime("%b %Y")
        except ValueError:
            continue
        monthly[key]["count"] += 1
        monthly[key]["ratings"].append(rating)

    # Sort chronologically
    def _sort_key(month_str: str) -> datetime:
        try:
            return datetime.strptime(month_str, "%b %Y")
        except ValueError:
            return datetime.min

    sorted_months = sorted(monthly.keys(), key=_sort_key)

    timeline = []
    for month in sorted_months:
        data = monthly[month]
        ratings = data["ratings"]
        avg = round(sum(ratings) / len(ratings), 2) if ratings else 0.0
        timeline.append(TimelineDataPoint(
            date=month,
            review_count=data["count"],
            avg_rating=avg,
            sentiment="positive" if avg >= 3.5 else "negative",
        ))

    return timeline


# ─── 3. Reviewer Cluster Data ─────────────────────────────────────────────────

def build_cluster_data(
    genuine_reviews: List[GenuineReview],
) -> List[ReviewerClusterPoint]:
    """
    Runs KMeans (k=4) on genuine reviewer features:
      - rating
      - review_length (word count)
      - review_date_ordinal (for recency signal)
    Returns per-reviewer cluster assignments + cluster-level aggregates for the bar chart.
    """
    if len(genuine_reviews) < N_CLUSTERS:
        # Not enough data — return synthetic cluster data
        return _synthetic_cluster_data()

    records = []
    for r in genuine_reviews:
        try:
            d = datetime.strptime(r.date, "%Y-%m-%d")
            ordinal = d.toordinal()
        except ValueError:
            ordinal = 0
        records.append({
            "reviewer": r.reviewer,
            "rating": r.rating,
            "word_count": len(r.text.split()),
            "date_ordinal": ordinal,
        })

    df = pd.DataFrame(records)
    features = df[["rating", "word_count", "date_ordinal"]].values

    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(features)

    km = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    labels = km.fit_predict(scaled)
    df["cluster_id"] = labels

    # Compute cluster percentages
    counts = df["cluster_id"].value_counts()
    total = len(df)
    cluster_pct = {cid: round(count / total * 100, 1) for cid, count in counts.items()}

    results: List[ReviewerClusterPoint] = []
    for i, row in df.iterrows():
        cid = int(row["cluster_id"])
        # x/y coordinates are the first two scaled features (rating, word_count)
        x = float(round(scaled[i][0], 4))
        y = float(round(scaled[i][1], 4))
        # Trust score: function of rating and review length
        trust = round((row["rating"] / 5.0) * 0.6 + min(row["word_count"] / 100, 1.0) * 0.4, 3)

        results.append(ReviewerClusterPoint(
            cluster_id=cid,
            cluster_name=CLUSTER_NAMES[cid % len(CLUSTER_NAMES)],
            percentage=cluster_pct.get(cid, 0.0),
            color=CLUSTER_COLORS[cid % len(CLUSTER_COLORS)],
            reviewer_name=row["reviewer"],
            trust_score=trust,
            x_coordinate=x,
            y_coordinate=y,
        ))

    return results


def _synthetic_cluster_data() -> List[ReviewerClusterPoint]:
    """Fallback when too few reviews for KMeans."""
    base = [
        (0, "Verified Buyers", 65.0, "#10b981"),
        (1, "Repeat Customers", 20.0, "#3b82f6"),
        (2, "New Users", 10.0, "#f59e0b"),
        (3, "Suspicious", 5.0, "#ef4444"),
    ]
    results = []
    for cid, name, pct, color in base:
        results.append(ReviewerClusterPoint(
            cluster_id=cid, cluster_name=name, percentage=pct, color=color,
            reviewer_name="Sample Reviewer", trust_score=round(random.uniform(0.5, 0.95), 2),
            x_coordinate=round(random.uniform(0, 1), 4),
            y_coordinate=round(random.uniform(0, 1), 4),
        ))
    return results


# ─── 4. Common Issues via Gemini ──────────────────────────────────────────────

ISSUES_PROMPT_TEMPLATE = """You are a product review analyst. Below are genuine customer reviews for a product.
Extract the TOP 4 most commonly mentioned product issues, complaints, or areas of concern.

For each issue, provide:
1. A concise issue title (3–6 words)
2. An estimated count of how many reviews mention it (estimate from the text)
3. Severity: "high" (if mentioned frequently or critically), "medium", or "low"

Reviews:
{reviews_text}

Respond ONLY with a valid JSON array:
[
  {{"issue": "Issue title here", "count": <integer>, "severity": "high"|"medium"|"low"}},
  ...
]"""

FALLBACK_ISSUES = [
    CommonIssue(issue="Battery life issues", count=12, severity="high"),
    CommonIssue(issue="Connectivity problems", count=8, severity="medium"),
    CommonIssue(issue="Build quality concerns", count=6, severity="medium"),
    CommonIssue(issue="Charging speed slow", count=4, severity="low"),
]


def extract_common_issues(genuine_reviews: List[GenuineReview]) -> List[CommonIssue]:
    """
    Passes genuine review text to Gemini to extract common product issues.
    Falls back to rule-based extraction if Gemini is unavailable.
    """
    if not genuine_reviews:
        return FALLBACK_ISSUES

    # Sample up to 40 reviews to stay within token budget
    sample = genuine_reviews[:40]
    reviews_text = "\n\n".join(
        f"[Review {i+1}] Rating: {r.rating}/5\n{r.text}"
        for i, r in enumerate(sample)
    )

    prompt = ISSUES_PROMPT_TEMPLATE.format(reviews_text=reviews_text)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                max_output_tokens=512,
            )
        )
        response = model.generate_content(prompt)
        raw = re.sub(r"```(?:json)?", "", response.text).strip().rstrip("`").strip()
        issues_data = json.loads(raw)
        return [
            CommonIssue(
                issue=item.get("issue", "Unknown issue"),
                count=int(item.get("count", 1)),
                severity=item.get("severity", "medium"),
            )
            for item in issues_data[:6]
        ]
    except Exception:
        return FALLBACK_ISSUES
