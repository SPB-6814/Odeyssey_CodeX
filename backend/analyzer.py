"""
Core NLP/ML Engine for Fake Review Detection.

Pipeline:
1. Text preprocessing & NLP feature extraction (TextBlob)
2. TF-IDF vectorization + cosine similarity for duplicate detection
3. Behavioral feature engineering
4. Isolation Forest anomaly detection
5. Trust score computation (ensemble of heuristics + ML)
6. DBSCAN reviewer clustering
7. Common issues extraction via TF-IDF keyword ranking
"""

import re
import math
import numpy as np
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import networkx as nx


class ReviewAnalyzer:
    """Main analysis engine that orchestrates the full pipeline."""

    def __init__(self):
        self.tfidf = TfidfVectorizer(max_features=5000, stop_words='english', ngram_range=(1, 2))

    # ──────────────────────────────────────────────────────────────────────
    #  PUBLIC API
    # ──────────────────────────────────────────────────────────────────────

    def analyze(self, reviews: list, product_info: dict) -> dict:
        """Run the full analysis pipeline and return structured results."""
        if not reviews:
            return self._empty_result(product_info)

        # Step 1 — NLP feature extraction
        enriched = [self._extract_nlp_features(r) for r in reviews]

        # Step 2 — Similarity / duplicate detection
        enriched = self._detect_duplicates(enriched)

        # Step 3 — Behavioral analysis
        enriched = self._behavioral_analysis(enriched)

        # Step 4 — ML anomaly detection (Isolation Forest)
        enriched = self._ml_anomaly_detection(enriched)

        # Step 5 — Compute final trust score & classify
        enriched = self._compute_trust_scores(enriched)

        # Separate genuine vs fake
        genuine = [r for r in enriched if r["is_genuine"]]
        fake = [r for r in enriched if not r["is_genuine"]]

        # Step 6 — Adjusted rating
        original_rating = product_info.get("original_rating", 0)
        adjusted_rating = self._compute_adjusted_rating(genuine, original_rating)

        # Step 7 — Timeline
        timeline = self._generate_timeline(enriched)

        # Step 8 — Reviewer clustering (DBSCAN)
        clusters = self._cluster_reviewers(enriched)

        # Step 9 — Common issues
        common_issues = self._extract_common_issues(genuine)

        # Step 10 — Fake patterns summary
        fake_patterns = self._detect_fake_patterns(enriched, fake)

        # Confidence score
        confidence = self._compute_confidence(enriched)

        return {
            "product": product_info,
            "ratings": {
                "original": round(original_rating, 1),
                "adjusted": round(adjusted_rating, 1),
                "total_reviews": len(enriched),
                "genuine_count": len(genuine),
                "fake_count": len(fake),
                "confidence": round(confidence, 2),
            },
            "reviews": {
                "genuine": self._format_reviews(genuine),
                "fake": self._format_reviews(fake),
            },
            "timeline": timeline,
            "clusters": clusters,
            "common_issues": common_issues,
            "fake_patterns": fake_patterns,
        }

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 1: NLP FEATURE EXTRACTION
    # ──────────────────────────────────────────────────────────────────────

    def _extract_nlp_features(self, review: dict) -> dict:
        """Extract NLP features from a single review."""
        text = review.get("text", "")
        blob = TextBlob(text)

        # Basic text stats
        word_count = len(text.split())
        char_count = len(text)
        sentence_count = max(len(blob.sentences), 1)
        avg_word_length = char_count / max(word_count, 1)

        # Caps & punctuation ratios
        caps_count = sum(1 for c in text if c.isupper())
        caps_ratio = caps_count / max(char_count, 1)
        exclamation_count = text.count("!")
        question_count = text.count("?")

        # Sentiment
        sentiment_polarity = blob.sentiment.polarity      # -1 to 1
        sentiment_subjectivity = blob.sentiment.subjectivity  # 0 to 1

        # Rating-sentiment mismatch
        rating = review.get("rating", 3)
        expected_sentiment = (rating - 3) / 2  # map 1-5 → -1 to 1
        sentiment_mismatch = abs(sentiment_polarity - expected_sentiment)

        # Lexical diversity
        words = [w.lower() for w in text.split()]
        unique_words = set(words)
        lexical_diversity = len(unique_words) / max(len(words), 1)

        review["nlp"] = {
            "word_count": word_count,
            "char_count": char_count,
            "sentence_count": sentence_count,
            "avg_word_length": avg_word_length,
            "caps_ratio": caps_ratio,
            "exclamation_count": exclamation_count,
            "question_count": question_count,
            "sentiment_polarity": sentiment_polarity,
            "sentiment_subjectivity": sentiment_subjectivity,
            "sentiment_mismatch": sentiment_mismatch,
            "lexical_diversity": lexical_diversity,
        }
        return review

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 2: DUPLICATE / SIMILARITY DETECTION
    # ──────────────────────────────────────────────────────────────────────

    def _detect_duplicates(self, reviews: list) -> list:
        """Find near-duplicate reviews using TF-IDF cosine similarity."""
        texts = [r.get("text", "") for r in reviews]

        if len(texts) < 2:
            for r in reviews:
                r["similarity_score"] = 0.0
            return reviews

        try:
            tfidf_matrix = self.tfidf.fit_transform(texts)
            sim_matrix = cosine_similarity(tfidf_matrix)

            for i, review in enumerate(reviews):
                # Max similarity with any other review
                sims = sim_matrix[i].copy()
                sims[i] = 0  # exclude self
                max_sim = float(np.max(sims))
                avg_sim = float(np.mean(sims[sims > 0.3])) if np.any(sims > 0.3) else 0.0
                review["similarity_score"] = max(max_sim, avg_sim)
        except Exception:
            for r in reviews:
                r["similarity_score"] = 0.0

        return reviews

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 3: BEHAVIORAL ANALYSIS
    # ──────────────────────────────────────────────────────────────────────

    def _behavioral_analysis(self, reviews: list) -> list:
        """Analyze temporal and account-level behavioral signals."""
        # Parse dates
        dates = []
        for r in reviews:
            try:
                dt = datetime.fromisoformat(r["date"])
            except (ValueError, KeyError):
                dt = datetime.now()
            r["_dt"] = dt
            dates.append(dt)

        if not dates:
            for r in reviews:
                r["behavioral_score"] = 0.0
            return reviews

        # Temporal burst detection — reviews per day
        date_counts = Counter(dt.strftime("%Y-%m-%d") for dt in dates)
        avg_daily = np.mean(list(date_counts.values())) if date_counts else 1
        std_daily = np.std(list(date_counts.values())) if len(date_counts) > 1 else 0

        for r in reviews:
            score = 0.0
            reviewer = r.get("reviewer", {})

            # Account age signal (new accounts are suspicious)
            account_age = reviewer.get("account_age_days", 365)
            if account_age < 7:
                score += 0.4
            elif account_age < 30:
                score += 0.2
            elif account_age < 90:
                score += 0.1

            # Unverified purchase
            if not reviewer.get("verified", True):
                score += 0.15

            # Review count signal
            total_reviews = reviewer.get("total_reviews", 10)
            if total_reviews <= 1:
                score += 0.2
            elif total_reviews > 50 and account_age < 30:
                score += 0.3  # high volume + new account = suspicious

            # Temporal burst signal
            day_str = r["_dt"].strftime("%Y-%m-%d")
            day_count = date_counts.get(day_str, 0)
            if std_daily > 0 and day_count > avg_daily + 2 * std_daily:
                score += 0.25

            # Low helpful votes
            if r.get("helpful_votes", 0) == 0:
                score += 0.05

            r["behavioral_score"] = min(score, 1.0)

        return reviews

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 4: ML ANOMALY DETECTION (Isolation Forest)
    # ──────────────────────────────────────────────────────────────────────

    def _ml_anomaly_detection(self, reviews: list) -> list:
        """Use Isolation Forest to flag anomalous reviews."""
        if len(reviews) < 10:
            for r in reviews:
                r["anomaly_score"] = 0.0
            return reviews

        features = []
        for r in reviews:
            nlp = r.get("nlp", {})
            features.append([
                nlp.get("word_count", 0),
                nlp.get("caps_ratio", 0),
                nlp.get("exclamation_count", 0),
                nlp.get("sentiment_polarity", 0),
                nlp.get("sentiment_subjectivity", 0),
                nlp.get("sentiment_mismatch", 0),
                nlp.get("lexical_diversity", 0),
                r.get("similarity_score", 0),
                r.get("behavioral_score", 0),
                r.get("rating", 3),
                r.get("helpful_votes", 0),
            ])

        X = np.array(features)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.3,
            random_state=42,
        )
        predictions = iso_forest.fit_predict(X_scaled)
        scores = iso_forest.decision_function(X_scaled)

        # Normalize scores to 0-1 (lower = more anomalous)
        min_s, max_s = scores.min(), scores.max()
        if max_s - min_s > 0:
            normalized = (scores - min_s) / (max_s - min_s)
        else:
            normalized = np.full_like(scores, 0.5)

        for i, r in enumerate(reviews):
            # Invert: higher anomaly_score = more suspicious
            r["anomaly_score"] = round(float(1 - normalized[i]), 3)

        return reviews

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 5: TRUST SCORE & CLASSIFICATION
    # ──────────────────────────────────────────────────────────────────────

    def _compute_trust_scores(self, reviews: list) -> list:
        """Ensemble trust score combining heuristics + ML."""
        for r in reviews:
            nlp = r.get("nlp", {})

            # Weights for each signal
            heuristic_score = 0.0

            # Caps ratio (>15% is suspicious)
            if nlp.get("caps_ratio", 0) > 0.3:
                heuristic_score += 0.25
            elif nlp.get("caps_ratio", 0) > 0.15:
                heuristic_score += 0.15

            # Excessive exclamation marks
            if nlp.get("exclamation_count", 0) > 5:
                heuristic_score += 0.2
            elif nlp.get("exclamation_count", 0) > 3:
                heuristic_score += 0.1

            # Very short or very long reviews
            wc = nlp.get("word_count", 20)
            if wc < 5:
                heuristic_score += 0.15
            elif wc < 10:
                heuristic_score += 0.05

            # Low lexical diversity (repetitive language)
            if nlp.get("lexical_diversity", 1) < 0.4:
                heuristic_score += 0.1

            # Extreme sentiment with extreme rating
            polarity = abs(nlp.get("sentiment_polarity", 0))
            subjectivity = nlp.get("sentiment_subjectivity", 0)
            if polarity > 0.8 and subjectivity > 0.8:
                heuristic_score += 0.15

            # Rating-sentiment mismatch
            if nlp.get("sentiment_mismatch", 0) > 0.8:
                heuristic_score += 0.15

            heuristic_score = min(heuristic_score, 1.0)

            # Ensemble: 30% heuristic, 35% ML anomaly, 35% behavioral
            anomaly = r.get("anomaly_score", 0)
            behavioral = r.get("behavioral_score", 0)
            similarity = r.get("similarity_score", 0)

            # Add similarity bonus
            if similarity > 0.7:
                heuristic_score = min(heuristic_score + 0.2, 1.0)

            fake_probability = (
                0.30 * heuristic_score +
                0.35 * anomaly +
                0.35 * behavioral
            )

            trust_score = round(max(0, min(100, (1 - fake_probability) * 100)))
            r["trust_score"] = trust_score
            r["fake_probability"] = round(fake_probability, 3)
            r["is_genuine"] = trust_score >= 50

            # Explainability — reasons why flagged
            reasons = []
            if nlp.get("caps_ratio", 0) > 0.15:
                reasons.append("Excessive use of capital letters")
            if nlp.get("exclamation_count", 0) > 3:
                reasons.append("Too many exclamation marks")
            if behavioral > 0.3:
                reviewer = r.get("reviewer", {})
                if reviewer.get("account_age_days", 365) < 30:
                    reasons.append("New account (less than 30 days old)")
                if not reviewer.get("verified", True):
                    reasons.append("Unverified purchase")
                if reviewer.get("total_reviews", 10) <= 1:
                    reasons.append("Only review from this account")
            if similarity > 0.7:
                reasons.append("Highly similar to other reviews")
            if nlp.get("sentiment_mismatch", 0) > 0.8:
                reasons.append("Rating does not match review sentiment")
            if anomaly > 0.6:
                reasons.append("Flagged by ML anomaly detection")

            r["flag_reasons"] = reasons if not r["is_genuine"] else []

        return reviews

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 6: ADJUSTED RATING
    # ──────────────────────────────────────────────────────────────────────

    def _compute_adjusted_rating(self, genuine_reviews: list, original_rating: float) -> float:
        """Compute adjusted rating using only genuine reviews, weighted by trust."""
        if not genuine_reviews:
            return original_rating

        total_weight = 0
        weighted_sum = 0
        for r in genuine_reviews:
            weight = r.get("trust_score", 50) / 100
            weighted_sum += r.get("rating", 3) * weight
            total_weight += weight

        if total_weight == 0:
            return original_rating

        return weighted_sum / total_weight

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 7: TIMELINE
    # ──────────────────────────────────────────────────────────────────────

    def _generate_timeline(self, reviews: list) -> list:
        """Group reviews by date for the timeline chart."""
        date_groups = defaultdict(lambda: {"total": 0, "genuine": 0, "fake": 0})

        for r in reviews:
            try:
                dt = datetime.fromisoformat(r["date"])
                # Group by week for cleaner visualization
                week_start = dt - timedelta(days=dt.weekday())
                key = week_start.strftime("%Y-%m-%d")
            except (ValueError, KeyError):
                continue

            date_groups[key]["total"] += 1
            if r.get("is_genuine", True):
                date_groups[key]["genuine"] += 1
            else:
                date_groups[key]["fake"] += 1

        timeline = []
        for date_str in sorted(date_groups.keys()):
            data = date_groups[date_str]
            timeline.append({
                "date": date_str,
                "total": data["total"],
                "genuine": data["genuine"],
                "fake": data["fake"],
            })

        return timeline

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 8: REVIEWER CLUSTERING (DBSCAN)
    # ──────────────────────────────────────────────────────────────────────

    def _cluster_reviewers(self, reviews: list) -> list:
        """Cluster reviewers using DBSCAN to find coordinated groups."""
        if len(reviews) < 5:
            return []

        # Build reviewer feature vectors
        reviewer_data = []
        for r in reviews:
            reviewer = r.get("reviewer", {})
            nlp = r.get("nlp", {})
            reviewer_data.append({
                "name": reviewer.get("name", "Unknown"),
                "features": [
                    reviewer.get("account_age_days", 365) / 3650,  # normalize
                    reviewer.get("total_reviews", 10) / 200,
                    1.0 if reviewer.get("verified", False) else 0.0,
                    nlp.get("sentiment_polarity", 0),
                    nlp.get("caps_ratio", 0),
                    r.get("rating", 3) / 5.0,
                    r.get("trust_score", 50) / 100,
                ],
                "trust_score": r.get("trust_score", 50),
                "is_genuine": r.get("is_genuine", True),
            })

        X = np.array([d["features"] for d in reviewer_data])
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # DBSCAN clustering
        dbscan = DBSCAN(eps=0.8, min_samples=3)
        labels = dbscan.fit_predict(X_scaled)

        # Build cluster data for visualization — use 2D projection
        clusters = []
        for i, (data, label) in enumerate(zip(reviewer_data, labels)):
            clusters.append({
                "id": i,
                "name": data["name"],
                "x": round(float(X_scaled[i][0] * 50 + 50), 1),  # scale to 0-100
                "y": round(float(X_scaled[i][3] * 50 + 50), 1),
                "cluster": int(label),
                "trust_score": data["trust_score"],
                "suspicious": not data["is_genuine"],
                "size": max(5, data["trust_score"] // 10),
            })

        return clusters

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 9: COMMON ISSUES EXTRACTION
    # ──────────────────────────────────────────────────────────────────────

    def _extract_common_issues(self, genuine_reviews: list) -> list:
        """Extract common issues from genuine negative reviews using TF-IDF."""
        # Filter to negative/neutral genuine reviews
        negative_reviews = [r for r in genuine_reviews if r.get("rating", 5) <= 3]

        if not negative_reviews:
            return []

        texts = [r.get("text", "") for r in negative_reviews]

        try:
            issue_tfidf = TfidfVectorizer(
                max_features=200,
                stop_words='english',
                ngram_range=(1, 3),
                min_df=1,
            )
            tfidf_matrix = issue_tfidf.fit_transform(texts)
            feature_names = issue_tfidf.get_feature_names_out()

            # Average TF-IDF scores across documents
            avg_scores = np.array(tfidf_matrix.mean(axis=0)).flatten()
            top_indices = avg_scores.argsort()[-15:][::-1]

            # Group related keywords into issues
            issues_raw = []
            for idx in top_indices:
                keyword = feature_names[idx]
                if len(keyword) > 3:  # skip very short words
                    score = float(avg_scores[idx])
                    # Count how many reviews mention this
                    count = sum(1 for t in texts if keyword.lower() in t.lower())
                    if count >= 1:
                        issues_raw.append({
                            "issue": keyword.title().replace("_", " "),
                            "count": count,
                            "relevance": round(score, 3),
                        })

            # Deduplicate — remove substrings
            issues = []
            seen = set()
            for issue in issues_raw[:8]:
                key = issue["issue"].lower()
                if not any(key in s or s in key for s in seen):
                    severity = "high" if issue["count"] >= 3 else "medium" if issue["count"] >= 2 else "low"
                    issue["severity"] = severity
                    issues.append(issue)
                    seen.add(key)

            return issues[:6]

        except Exception:
            return []

    # ──────────────────────────────────────────────────────────────────────
    #  STEP 10: FAKE PATTERN DETECTION
    # ──────────────────────────────────────────────────────────────────────

    def _detect_fake_patterns(self, all_reviews: list, fake_reviews: list) -> list:
        """Identify and describe patterns in fake reviews."""
        patterns = []

        if not fake_reviews:
            return patterns

        # Pattern 1: Temporal bursts
        fake_dates = []
        for r in fake_reviews:
            try:
                fake_dates.append(datetime.fromisoformat(r["date"]))
            except (ValueError, KeyError):
                continue

        if fake_dates:
            fake_dates.sort()
            # Check for bursts (multiple fake reviews within 3 days)
            i = 0
            while i < len(fake_dates):
                burst = [fake_dates[i]]
                j = i + 1
                while j < len(fake_dates) and (fake_dates[j] - fake_dates[i]).days <= 3:
                    burst.append(fake_dates[j])
                    j += 1
                if len(burst) >= 3:
                    patterns.append({
                        "pattern": "Review Burst Detected",
                        "description": f"{len(burst)} suspicious reviews posted within 3 days around {burst[0].strftime('%B %d, %Y')}",
                        "severity": "high",
                    })
                i = j if j > i + 1 else i + 1

        # Pattern 2: New account spam
        new_accounts = [r for r in fake_reviews if r.get("reviewer", {}).get("account_age_days", 365) < 14]
        if len(new_accounts) >= 3:
            patterns.append({
                "pattern": "New Account Spam",
                "description": f"{len(new_accounts)} fake reviews from accounts less than 14 days old",
                "severity": "high",
            })

        # Pattern 3: Duplicate content
        high_sim = [r for r in fake_reviews if r.get("similarity_score", 0) > 0.7]
        if len(high_sim) >= 2:
            patterns.append({
                "pattern": "Duplicate/Template Reviews",
                "description": f"{len(high_sim)} reviews share very similar language, suggesting copy-paste or template use",
                "severity": "medium",
            })

        # Pattern 4: Rating manipulation
        fake_5_star = sum(1 for r in fake_reviews if r.get("rating", 0) == 5)
        fake_1_star = sum(1 for r in fake_reviews if r.get("rating", 0) == 1)
        if fake_5_star > len(fake_reviews) * 0.5:
            patterns.append({
                "pattern": "Positive Rating Manipulation",
                "description": f"{fake_5_star} fake 5-star reviews detected, likely boosting the product rating",
                "severity": "high",
            })
        if fake_1_star > len(fake_reviews) * 0.3:
            patterns.append({
                "pattern": "Negative Review Attack",
                "description": f"{fake_1_star} fake 1-star reviews detected, possibly a competitor attack",
                "severity": "high",
            })

        return patterns

    # ──────────────────────────────────────────────────────────────────────
    #  HELPERS
    # ──────────────────────────────────────────────────────────────────────

    def _compute_confidence(self, reviews: list) -> float:
        """Overall confidence in the analysis based on data quality."""
        if len(reviews) < 10:
            return 0.5
        if len(reviews) < 30:
            return 0.7
        return min(0.95, 0.75 + len(reviews) / 1000)

    def _format_reviews(self, reviews: list) -> list:
        """Clean up review objects for API response."""
        formatted = []
        for r in reviews:
            formatted.append({
                "id": r.get("id", ""),
                "text": r.get("text", ""),
                "title": r.get("title", ""),
                "rating": r.get("rating", 0),
                "date": r.get("date", ""),
                "reviewer_name": r.get("reviewer", {}).get("name", "Anonymous"),
                "verified": r.get("reviewer", {}).get("verified", False),
                "helpful_votes": r.get("helpful_votes", 0),
                "trust_score": r.get("trust_score", 50),
                "fake_probability": r.get("fake_probability", 0),
                "flag_reasons": r.get("flag_reasons", []),
            })
        # Sort by trust score
        formatted.sort(key=lambda x: x["trust_score"], reverse=(formatted and formatted[0].get("trust_score", 0) > 50))
        return formatted

    def _empty_result(self, product_info: dict) -> dict:
        return {
            "product": product_info,
            "ratings": {"original": 0, "adjusted": 0, "total_reviews": 0,
                        "genuine_count": 0, "fake_count": 0, "confidence": 0},
            "reviews": {"genuine": [], "fake": []},
            "timeline": [],
            "clusters": [],
            "common_issues": [],
            "fake_patterns": [],
        }
