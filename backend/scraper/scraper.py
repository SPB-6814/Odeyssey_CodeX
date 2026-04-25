"""
Mock product scraper.
Returns realistic product data + a pool of reviews when given a product URL.
Designed to be easily swapped for real BeautifulSoup/Playwright scraping.
"""
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List

from models.schemas import RawReview


# ─── Realistic reviewer name pools ───────────────────────────────────────────

FIRST_NAMES = [
    "James", "Maria", "David", "Sarah", "Michael", "Emily", "Robert", "Jessica",
    "William", "Ashley", "Richard", "Amanda", "Joseph", "Melissa", "Thomas",
    "Stephanie", "Charles", "Rebecca", "Christopher", "Sharon", "Daniel", "Laura",
    "Matthew", "Cynthia", "Anthony", "Kathleen", "Kevin", "Amy", "Rahul", "Priya",
    "Arjun", "Anjali", "Wei", "Mei", "Carlos", "Sofia", "Luca", "Isabella"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Wilson", "Anderson", "Taylor", "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Patel", "Sharma", "Kumar", "Singh", "Chen", "Wang", "Li",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Lee", "Kim", "Park"
]


# ─── Genuine review text templates ───────────────────────────────────────────

GENUINE_REVIEW_TEMPLATES = [
    "Great product overall. Battery life is solid but the {issue} could be better. Would still buy again.",
    "Been using this for 3 months now. {positive} is impressive. The {issue} is a minor annoyance.",
    "Purchased this for my {use_case}. Works exactly as advertised. Assembly was straightforward.",
    "Quality is decent for the price point. The {positive} surprised me positively. Shipping was fast.",
    "I was skeptical at first but this exceeded expectations. The {issue} is a known trade-off.",
    "Love the {positive} feature. Had to contact support once — they were helpful and responsive.",
    "Solid build quality. Not the best on the market but great value. The {issue} needs improvement.",
    "My {use_case} use case is perfectly covered. Wish they had fixed the {issue} though.",
    "Third product from this brand. Consistent quality. {positive} is the standout feature this time.",
    "Does what it promises. The {issue} is a bit annoying but not a dealbreaker for most users.",
    "Perfect for {use_case}. Arrived well-packaged. Set up in under 20 minutes. Highly recommend.",
    "Five stars if not for the {issue}. Everything else is excellent — especially the {positive}.",
    "Bought as a gift. Recipient loved the {positive}. Minor {issue} but overall thumbs up.",
    "Tested against three competitors. This wins on {positive} but loses on {issue}.",
    "Real talk: the {issue} is frustrating but the {positive} more than makes up for it.",
]

FAKE_REVIEW_TEMPLATES = [
    "AMAZING!!! BEST PRODUCT EVER!!! Changed my life completely!!! 10/10 would recommend to everyone!!!",
    "Absolutely perfect in every way. No issues whatsoever. Buy this immediately you will not regret it!",
    "This product is incredible outstanding fantastic superb excellent wonderful magnificent phenomenal!!!",
    "I bought this yesterday and already it is the best thing I have ever purchased in my entire life!!!",
    "Five stars!!! Perfect!!! Best seller!!! Top quality!!! Must buy!!! Don't hesitate!!!",
    "WOW just WOW. Everything about this is perfect. Perfect packaging, perfect product, perfect service.",
    "Best purchase of 2024. Incredible value. Everyone should own one of these. Simply outstanding.",
    "I have bought many products but nothing compares to this. Exceeded every expectation. 100% recommend.",
    "Top quality product arrived fast. Everything perfect. Will buy again and tell all my friends and family!",
    "Just got this and instantly fell in love. Game changer. Life changing. Must have product of the year.",
]

ISSUES = [
    "charging speed", "microphone quality", "button placement", "app connectivity",
    "noise cancellation", "battery drain", "touch sensitivity", "heat management",
    "water resistance seal", "carrying case quality", "volume limit", "pairing process"
]

POSITIVES = [
    "sound clarity", "build quality", "comfort during long sessions", "bass response",
    "wireless range", "battery life", "quick charge feature", "multi-device pairing",
    "premium feel", "noise cancellation", "auto-power feature", "call quality"
]

USE_CASES = [
    "daily commute", "gym sessions", "work from home", "travel", "gaming",
    "podcast listening", "online meetings", "outdoor activities", "coding sessions"
]


def _random_date(start_days_ago: int = 365, end_days_ago: int = 0) -> str:
    """Generate a random ISO date within the past N days."""
    delta = random.randint(end_days_ago, start_days_ago)
    d = datetime.now() - timedelta(days=delta)
    return d.strftime("%Y-%m-%d")


def _reviewer_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def _reviewer_id(name: str) -> str:
    return hashlib.md5(f"{name}{random.randint(1000,9999)}".encode()).hexdigest()[:10]


def _generate_genuine_reviews(n: int) -> List[RawReview]:
    reviews = []
    for _ in range(n):
        template = random.choice(GENUINE_REVIEW_TEMPLATES)
        text = template.format(
            issue=random.choice(ISSUES),
            positive=random.choice(POSITIVES),
            use_case=random.choice(USE_CASES)
        )
        name = _reviewer_name()
        reviews.append(RawReview(
            reviewer_id=_reviewer_id(name),
            reviewer=name,
            rating=round(random.uniform(3.0, 5.0), 1),
            text=text,
            date=_random_date(365, 0)
        ))
    return reviews


def _generate_fake_reviews(n: int) -> List[RawReview]:
    """
    Fake reviews: clustered dates (coordinated campaign),
    extreme ratings (almost always 5-star), generic superlative text.
    """
    reviews = []
    # Pick a random "campaign burst" date — all fake reviews cluster around it
    campaign_center = datetime.now() - timedelta(days=random.randint(30, 180))
    for _ in range(n):
        text = random.choice(FAKE_REVIEW_TEMPLATES)
        name = _reviewer_name()
        # Cluster dates within ±7 days of the campaign center
        offset = random.randint(-7, 7)
        date = (campaign_center + timedelta(days=offset)).strftime("%Y-%m-%d")
        reviews.append(RawReview(
            reviewer_id=_reviewer_id(name),
            reviewer=name,
            rating=random.choice([4.5, 5.0, 5.0, 5.0, 5.0]),  # heavily skewed to 5
            text=text,
            date=date
        ))
    return reviews


# ─── Product templates ────────────────────────────────────────────────────────

PRODUCT_TEMPLATES = [
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "category": "Electronics",
        "original_rating": 4.4,
        "total_reviews_range": (800, 2000),
    },
    {
        "name": "Anker Soundcore Life Q45 Headphones",
        "category": "Electronics",
        "original_rating": 4.3,
        "total_reviews_range": (500, 1500),
    },
    {
        "name": "Instant Pot Duo 7-in-1",
        "category": "Kitchen Appliances",
        "original_rating": 4.6,
        "total_reviews_range": (5000, 15000),
    },
    {
        "name": "Generic Bluetooth Speaker X900",
        "category": "Electronics",
        "original_rating": 4.5,
        "total_reviews_range": (200, 800),
    },
    {
        "name": "Logitech MX Master 3S Mouse",
        "category": "Computer Accessories",
        "original_rating": 4.7,
        "total_reviews_range": (2000, 6000),
    },
]


def scrape_product(url: str) -> Dict[str, Any]:
    """
    Mock scraper: extracts product data + reviews from a given URL.
    In production, swap the body of this function with real
    BeautifulSoup/httpx or Playwright logic.

    Returns a dict with 'product' metadata and 'reviews' (List[RawReview]).
    """
    # Deterministic-ish selection based on URL hash so same URL → same product
    seed = int(hashlib.md5(url.encode()).hexdigest(), 16) % len(PRODUCT_TEMPLATES)
    random.seed(seed)

    template = PRODUCT_TEMPLATES[seed]
    total = random.randint(*template["total_reviews_range"])

    # Realistic split: ~20–35% fake reviews
    fake_ratio = round(random.uniform(0.20, 0.35), 2)
    n_fake = int(total * fake_ratio)
    n_fake = max(5, min(n_fake, 60))   # cap for API budget

    # Keep genuine count reasonable too (cap for processing)
    n_genuine = max(10, min(int(total * (1 - fake_ratio)), 80))

    genuine_reviews = _generate_genuine_reviews(n_genuine)
    fake_reviews = _generate_fake_reviews(n_fake)
    all_reviews = genuine_reviews + fake_reviews
    random.shuffle(all_reviews)

    return {
        "product": {
            "name": template["name"],
            "category": template["category"],
            "original_rating": template["original_rating"],
            "total_reviews": total,
        },
        "reviews": all_reviews,
        # Pass these through so the aggregator knows the ground-truth split
        "_genuine_ids": {r.reviewer_id for r in genuine_reviews},
    }
