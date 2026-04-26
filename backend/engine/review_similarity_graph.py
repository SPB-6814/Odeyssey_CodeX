"""
Review similarity scoring and graph construction utilities.

Implements:
- calculate_review_similarity(user_a, user_b)
- ReviewSimilarityGraph
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from difflib import SequenceMatcher
from itertools import combinations
from typing import Any, Dict, List, Optional

import networkx as nx


def _parse_datetime(value: Any) -> Optional[datetime]:
    """Parse datetime-like inputs safely."""
    if value is None:
        return None

    if isinstance(value, datetime):
        return value

    text = str(value).strip()
    if not text:
        return None

    # Common timestamp/date patterns.
    patterns = [
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
    ]

    # Handle trailing Z for UTC.
    if text.endswith("Z"):
        text = text[:-1] + "+0000"

    # Normalize timezone format like +00:00 -> +0000 for strptime compatibility.
    if len(text) >= 6 and (text[-6] in ["+", "-"]) and text[-3] == ":":
        text = text[:-3] + text[-2:]

    for pattern in patterns:
        try:
            return datetime.strptime(text, pattern)
        except ValueError:
            continue

    return None


def _safe_text(value: Any) -> str:
    return str(value or "").strip().lower()


def _safe_rating(value: Any) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def calculate_review_similarity(user_a: Dict[str, Any], user_b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute weighted similarity score (0-100) between two review objects.

    Expected fields in each object:
    - text
    - rating
    - timestamp
    - account_creation_date
    - user_id

    Returns:
      {
        "weight": <float>,
        "reasons": [<str>, ...],
        "components": {
            "temporal_proximity": <float>,
            "account_synchronicity": <float>,
            "text_similarity": <float>,
            "rating_identicality": <float>
        },
        "text_similarity_ratio": <float>
      }
    """
    score = 0.0
    reasons: List[str] = []

    temporal_points = 0.0
    account_points = 0.0
    text_points = 0.0
    rating_points = 0.0

    # 1) Temporal Proximity: +40 points if posted within 1 hour.
    ts_a = _parse_datetime(user_a.get("timestamp"))
    ts_b = _parse_datetime(user_b.get("timestamp"))
    if ts_a and ts_b:
        diff_seconds = abs((ts_a - ts_b).total_seconds())
        if diff_seconds <= 3600:
            temporal_points = 40.0
            score += temporal_points
            reasons.append("Temporal proximity: posted within 1 hour (+40)")

    # 2) Account Synchronicity: +30 points if account created same day.
    ac_a = _parse_datetime(user_a.get("account_creation_date"))
    ac_b = _parse_datetime(user_b.get("account_creation_date"))
    if ac_a and ac_b and ac_a.date() == ac_b.date():
        account_points = 30.0
        score += account_points
        reasons.append("Account synchronicity: same account creation day (+30)")

    # 3) Text Similarity: up to +30 if > 70% identical.
    txt_a = _safe_text(user_a.get("text"))
    txt_b = _safe_text(user_b.get("text"))
    similarity_ratio = 0.0
    if txt_a and txt_b:
        similarity_ratio = SequenceMatcher(None, txt_a, txt_b).ratio()
        if similarity_ratio > 0.70:
            # Scale 0.70..1.00 to 0..30
            text_points = min(30.0, ((similarity_ratio - 0.70) / 0.30) * 30.0)
            text_points = round(text_points, 2)
            score += text_points
            reasons.append(
                f"Text similarity: {similarity_ratio:.2%} identical (+{text_points})"
            )

    # 4) Rating Identicality: +10 if both are 5-star or both 1-star.
    r_a = _safe_rating(user_a.get("rating"))
    r_b = _safe_rating(user_b.get("rating"))
    if r_a is not None and r_b is not None:
        both_five = r_a == 5.0 and r_b == 5.0
        both_one = r_a == 1.0 and r_b == 1.0
        if both_five or both_one:
            rating_points = 10.0
            score += rating_points
            reasons.append("Rating identicality: both extreme rating (+10)")

    score = round(max(0.0, min(100.0, score)), 2)

    return {
        "weight": score,
        "reasons": reasons,
        "components": {
            "temporal_proximity": temporal_points,
            "account_synchronicity": account_points,
            "text_similarity": text_points,
            "rating_identicality": rating_points,
        },
        "text_similarity_ratio": round(similarity_ratio, 4),
    }


@dataclass
class ReviewSimilarityGraph:
    """
    Build and analyze a weighted similarity graph for a single product's reviews.

    Workflow:
      1) Create one node per user
      2) Create weighted edge for every user pair
      3) Threshold prune edges with weight < threshold
      4) Find connected components
      5) Export graph JSON for D3 / react-force-graph
    """

    reviews: List[Dict[str, Any]]
    threshold: float = 60.0

    def __post_init__(self) -> None:
        self.graph = nx.Graph()
        self._node_ids: List[str] = []
        self._cluster_sizes: Dict[str, int] = {}

    def _resolve_user_id(self, review: Dict[str, Any], idx: int) -> str:
        return str(
            review.get("user_id")
            or review.get("reviewer_id")
            or review.get("reviewer")
            or f"user_{idx}"
        )

    def build(self) -> nx.Graph:
        """Create full pairwise graph, then prune weak edges."""
        self.graph.clear()
        self._node_ids.clear()

        # Add nodes.
        for idx, review in enumerate(self.reviews):
            user_id = self._resolve_user_id(review, idx)
            self._node_ids.append(user_id)
            self.graph.add_node(user_id, **review)

        # Add weighted edges for every pair.
        for i, j in combinations(range(len(self.reviews)), 2):
            a = self.reviews[i]
            b = self.reviews[j]
            source = self._node_ids[i]
            target = self._node_ids[j]

            similarity = calculate_review_similarity(a, b)
            self.graph.add_edge(
                source,
                target,
                weight=similarity["weight"],
                reasons=similarity["reasons"],
                components=similarity["components"],
                text_similarity_ratio=similarity["text_similarity_ratio"],
            )

        # Threshold prune.
        edges_to_remove = [
            (u, v)
            for u, v, data in self.graph.edges(data=True)
            if float(data.get("weight", 0.0)) < self.threshold
        ]
        self.graph.remove_edges_from(edges_to_remove)

        return self.graph

    def connected_components(self) -> List[List[str]]:
        """Run connected components on pruned graph."""
        components = [list(component) for component in nx.connected_components(self.graph)]

        self._cluster_sizes = {}
        for component in components:
            size = len(component)
            for node_id in component:
                self._cluster_sizes[node_id] = size

        # Isolated nodes (size=1) if not present.
        for node_id in self.graph.nodes:
            self._cluster_sizes.setdefault(node_id, 1)

        return components

    def to_force_graph_json(self) -> Dict[str, Any]:
        """
        Export D3.js / react-force-graph compatible JSON.

        Nodes:
          - red if cluster size > 3
          - green otherwise
        """
        if not self.graph.nodes:
            self.build()

        if not self._cluster_sizes:
            self.connected_components()

        nodes = []
        for node_id in self.graph.nodes:
            size = self._cluster_sizes.get(node_id, 1)
            color = "red" if size > 3 else "green"
            node_payload = dict(self.graph.nodes[node_id])
            node_payload.update(
                {
                    "id": node_id,
                    "color": color,
                    "cluster_size": size,
                }
            )
            nodes.append(node_payload)

        links = []
        for source, target, data in self.graph.edges(data=True):
            links.append(
                {
                    "source": source,
                    "target": target,
                    "weight": float(data.get("weight", 0.0)),
                    "reasons": data.get("reasons", []),
                }
            )

        return {
            "nodes": nodes,
            "links": links,
            "meta": {
                "threshold": self.threshold,
                "node_count": len(nodes),
                "edge_count": len(links),
                "components": self.connected_components(),
            },
        }
