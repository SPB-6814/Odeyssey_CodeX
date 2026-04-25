"""
Campaign detection engine.
Flags coordinated fake review campaigns by:
1. Grouping fake reviews into 7-day windows and detecting bursts (velocity spikes)
2. Detecting cross-user text similarity via TF-IDF cosine similarity
"""
from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Dict, Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from models.schemas import FakeReview


# ─── Configuration ────────────────────────────────────────────────────────────

WINDOW_DAYS = 7          # bucket size for velocity analysis
VELOCITY_THRESHOLD = 3   # min fake reviews in a window to flag a campaign
SIMILARITY_THRESHOLD = 0.45  # cosine similarity to flag as coordinated


def detect_campaigns(fake_reviews: List[FakeReview]) -> Dict[str, Any]:
    """
    Analyse fake reviews for coordinated campaign patterns.

    Returns a dict with:
      - campaigns: list of detected campaign windows
      - review_velocity: max number of fake reviews in any 7-day window
      - coordinated_groups: groups of reviewers with highly similar texts
    """
    if not fake_reviews:
        return {"campaigns": [], "review_velocity": 0, "coordinated_groups": []}

    # ── 1. Temporal velocity analysis ─────────────────────────────────────────
    by_date: Dict[datetime, List[FakeReview]] = defaultdict(list)
    for r in fake_reviews:
        try:
            d = datetime.strptime(r.date, "%Y-%m-%d")
        except ValueError:
            continue
        by_date[d].append(r)

    if not by_date:
        return {"campaigns": [], "review_velocity": 0, "coordinated_groups": []}

    sorted_dates = sorted(by_date.keys())
    min_date, max_date = sorted_dates[0], sorted_dates[-1]

    campaigns = []
    review_velocity = 0
    window_start = min_date

    while window_start <= max_date:
        window_end = window_start + timedelta(days=WINDOW_DAYS)
        window_reviews = [
            r for d, reviews in by_date.items()
            if window_start <= d < window_end
            for r in reviews
        ]
        count = len(window_reviews)
        review_velocity = max(review_velocity, count)

        if count >= VELOCITY_THRESHOLD:
            campaigns.append({
                "start_date": window_start.strftime("%Y-%m-%d"),
                "end_date": window_end.strftime("%Y-%m-%d"),
                "review_count": count,
                "reviewers": list({r.reviewer for r in window_reviews}),
            })
        window_start += timedelta(days=WINDOW_DAYS)

    # ── 2. Text similarity analysis ───────────────────────────────────────────
    coordinated_groups = []
    if len(fake_reviews) >= 2:
        texts = [r.text for r in fake_reviews]
        reviewers = [r.reviewer for r in fake_reviews]
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=500)
            tfidf_matrix = vectorizer.fit_transform(texts)
            sim_matrix = cosine_similarity(tfidf_matrix)

            visited = set()
            for i in range(len(fake_reviews)):
                if i in visited:
                    continue
                group = [i]
                for j in range(i + 1, len(fake_reviews)):
                    if sim_matrix[i, j] >= SIMILARITY_THRESHOLD:
                        group.append(j)
                        visited.add(j)
                if len(group) > 1:
                    visited.add(i)
                    coordinated_groups.append({
                        "reviewers": [reviewers[idx] for idx in group],
                        "similarity_score": float(np.mean([
                            sim_matrix[a, b]
                            for i2, a in enumerate(group)
                            for b in group[i2 + 1:]
                        ])),
                    })
        except Exception:
            pass  # TF-IDF can fail on very short corpora — safe to skip

    return {
        "campaigns": campaigns,
        "review_velocity": review_velocity,
        "coordinated_groups": coordinated_groups,
    }
