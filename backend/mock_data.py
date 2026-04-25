"""
Mock data generator for the Fake Review Detection System.
Provides realistic fallback data when scraping is unavailable.
"""

import random
import hashlib
from datetime import datetime, timedelta


# ─── Reviewer Pools ──────────────────────────────────────────────────────────

GENUINE_REVIEWERS = [
    {"name": "Priya Sharma", "account_age_days": 1200, "total_reviews": 47, "verified": True},
    {"name": "Rahul Verma", "account_age_days": 890, "total_reviews": 23, "verified": True},
    {"name": "Ananya Patel", "account_age_days": 2100, "total_reviews": 112, "verified": True},
    {"name": "Vikram Singh", "account_age_days": 650, "total_reviews": 18, "verified": True},
    {"name": "Meera Krishnan", "account_age_days": 1500, "total_reviews": 67, "verified": True},
    {"name": "Arjun Reddy", "account_age_days": 1800, "total_reviews": 89, "verified": True},
    {"name": "Sneha Gupta", "account_age_days": 730, "total_reviews": 34, "verified": True},
    {"name": "Deepak Joshi", "account_age_days": 3000, "total_reviews": 156, "verified": True},
    {"name": "Kavita Nair", "account_age_days": 1100, "total_reviews": 41, "verified": True},
    {"name": "Rohan Desai", "account_age_days": 950, "total_reviews": 29, "verified": True},
    {"name": "Anjali Mehta", "account_age_days": 1400, "total_reviews": 55, "verified": True},
    {"name": "Suresh Kumar", "account_age_days": 2500, "total_reviews": 98, "verified": True},
]

SUSPICIOUS_REVIEWERS = [
    {"name": "User38291", "account_age_days": 5, "total_reviews": 1, "verified": False},
    {"name": "BestBuyerEver", "account_age_days": 12, "total_reviews": 45, "verified": False},
    {"name": "HappyCustomer99", "account_age_days": 3, "total_reviews": 1, "verified": False},
    {"name": "ReviewKing2024", "account_age_days": 8, "total_reviews": 87, "verified": False},
    {"name": "ShopLover_X", "account_age_days": 2, "total_reviews": 1, "verified": False},
    {"name": "ProductFan001", "account_age_days": 15, "total_reviews": 62, "verified": False},
    {"name": "TrustMe_Reviews", "account_age_days": 7, "total_reviews": 33, "verified": False},
    {"name": "TopReviewer999", "account_age_days": 4, "total_reviews": 1, "verified": False},
]


# ─── Product Database ────────────────────────────────────────────────────────

PRODUCTS = {
    "default": {
        "name": "Premium Wireless Headphones XR-500",
        "platform": "Amazon",
        "category": "Electronics",
        "price": "₹4,999",
        "image_url": "https://placehold.co/400x400/1a1a2e/e0e0e0?text=XR-500",
        "original_rating": 4.3,
        "total_ratings": 2847,
    },
    "iphone": {
        "name": "Apple iPhone 15 Pro Max (256 GB)",
        "platform": "Amazon",
        "category": "Smartphones",
        "price": "₹1,59,900",
        "image_url": "https://placehold.co/400x400/1a1a2e/e0e0e0?text=iPhone+15",
        "original_rating": 4.5,
        "total_ratings": 15234,
    },
    "samsung": {
        "name": "Samsung Galaxy S24 Ultra 5G",
        "platform": "Flipkart",
        "category": "Smartphones",
        "price": "₹1,29,999",
        "image_url": "https://placehold.co/400x400/1a1a2e/e0e0e0?text=Galaxy+S24",
        "original_rating": 4.4,
        "total_ratings": 8920,
    },
    "sony": {
        "name": "Sony WH-1000XM5 Noise Cancelling Headphones",
        "platform": "Amazon",
        "category": "Electronics",
        "price": "₹24,990",
        "image_url": "https://placehold.co/400x400/1a1a2e/e0e0e0?text=Sony+XM5",
        "original_rating": 4.6,
        "total_ratings": 5671,
    },
    "boat": {
        "name": "boAt Airdopes 141 TWS Earbuds",
        "platform": "Amazon",
        "category": "Electronics",
        "price": "₹1,299",
        "image_url": "https://placehold.co/400x400/1a1a2e/e0e0e0?text=boAt+141",
        "original_rating": 4.1,
        "total_ratings": 45230,
    },
}


# ─── Review Templates ────────────────────────────────────────────────────────

GENUINE_POSITIVE_REVIEWS = [
    "Been using this for about {months} months now. The build quality is solid and it does exactly what I expected. Battery life could be a bit better though.",
    "Good product overall. Took a couple of days to get used to the controls but now I really enjoy using it. Worth the price.",
    "I compared this with a few alternatives before buying. This one stood out for its {feature}. Not perfect but definitely good value for money.",
    "The {feature} is excellent, better than I expected. However, the {negative_aspect} leaves something to be desired. Overall 4/5.",
    "Bought this as a gift and the recipient loves it. The packaging was nice and delivery was on time. Seems well made.",
    "After extensive research and reading multiple reviews, I decided to purchase this. I'm satisfied with the {feature}. Some minor issues with {negative_aspect} but nothing deal-breaking.",
    "Using it daily for {months} months. It's held up well. The {feature} is genuinely impressive. Would recommend to anyone looking in this price range.",
    "Decent product. The {feature} works as advertised. Not the best I've used but certainly not bad either. Fair pricing.",
    "Had some initial concerns about the quality but I'm pleasantly surprised. The {feature} is great and customer support was helpful when I had questions.",
    "This is my second purchase of this brand. The quality is consistent. {feature} is the highlight for me. Minor con: {negative_aspect}.",
]

GENUINE_NEGATIVE_REVIEWS = [
    "Disappointed with the {negative_aspect}. Expected much better for this price point. The {feature} is okay but doesn't compensate.",
    "Used it for {months} months and it started showing issues. The {negative_aspect} worsened over time. Would not buy again.",
    "The product looks good but the {negative_aspect} is a serious concern. Contacted customer support and they were not very helpful.",
    "Not worth the premium price. You can find similar alternatives for much less. The {negative_aspect} is the main issue for me.",
    "Had high expectations based on the brand reputation but the {negative_aspect} really let me down. Average experience overall.",
]

FAKE_POSITIVE_REVIEWS = [
    "AMAZING PRODUCT!!! BEST PURCHASE EVER!!! 5 STARS ALL THE WAY!!! EVERYONE SHOULD BUY THIS!!!",
    "This is the BEST product I have ever bought in my entire life! It is absolutely perfect in every way! No complaints at all! 10/10!",
    "Wow just wow! This product changed my life completely! I cannot imagine living without it! Must buy for everyone!",
    "OUTSTANDING quality! INCREDIBLE value! SUPERB performance! I bought 5 more for my family! Best product EVER!",
    "Five stars! Perfect product! Amazing quality! Great packaging! Fast delivery! Love it! Best ever! Highly recommend!",
    "I am SO happy with this purchase! It works PERFECTLY and looks BEAUTIFUL! Everyone asks me about it and I tell them to BUY IT IMMEDIATELY!",
    "This product is absolutely PHENOMENAL! I have never been so satisfied with a purchase! The quality is UNMATCHED!",
    "Best product in the market! Nothing else comes close! If you're reading this, just buy it! Trust me, you won't regret it! AMAZING!",
    "Just received the product and I'm already in love! It's PERFECT! The best money I've ever spent! 100% recommended!",
    "Incredible incredible incredible! This is a masterpiece! Everyone needs this in their life! Absolute perfection!",
]

FAKE_NEGATIVE_REVIEWS = [
    "TERRIBLE PRODUCT! DO NOT BUY! WORST PURCHASE EVER! COMPLETE WASTE OF MONEY! 0 STARS IF I COULD!",
    "This product is absolutely HORRIBLE. It broke on the first day. The company is a SCAM. Stay away from this garbage!",
    "Worst product ever made. I don't know how they can sell this trash. Everything about it is terrible. DO NOT BUY!",
    "SCAM SCAM SCAM! This company should be shut down! The product is fake and cheap quality! No one should buy this!",
    "The worst purchase of my life! Completely useless! The company doesn't care about customers! AVOID AT ALL COSTS!",
]

FEATURES = ["sound quality", "display", "build quality", "battery life", "camera", "performance", "comfort", "connectivity", "design", "charging speed"]
NEGATIVE_ASPECTS = ["battery drainage", "heating issues", "build quality", "software bugs", "customer support", "weight", "price-to-value ratio", "durability"]


def _generate_id(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()[:12]


def _random_date(start_date: datetime, end_date: datetime) -> str:
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    random_hours = random.randint(0, 23)
    random_minutes = random.randint(0, 59)
    dt = start_date + timedelta(days=random_days, hours=random_hours, minutes=random_minutes)
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def _fill_template(template: str) -> str:
    """Fill in template placeholders with random realistic values."""
    result = template
    result = result.replace("{months}", str(random.randint(1, 18)))
    result = result.replace("{feature}", random.choice(FEATURES))
    result = result.replace("{negative_aspect}", random.choice(NEGATIVE_ASPECTS))
    return result


def get_product_info(query: str) -> dict:
    """Match a query to a product in our database."""
    query_lower = query.lower().strip()
    for key, product in PRODUCTS.items():
        if key in query_lower or any(word in query_lower for word in product["name"].lower().split()):
            return product.copy()
    # Default product
    return PRODUCTS["default"].copy()


def generate_mock_reviews(product_info: dict, count: int = 80) -> list:
    """Generate a realistic mix of genuine and fake reviews."""
    reviews = []
    now = datetime.now()
    start_date = now - timedelta(days=365)

    # Generate genuine positive reviews (40%)
    genuine_positive_count = int(count * 0.4)
    for i in range(genuine_positive_count):
        reviewer = random.choice(GENUINE_REVIEWERS)
        template = random.choice(GENUINE_POSITIVE_REVIEWS)
        text = _fill_template(template)
        rating = random.choice([4, 4, 4, 5, 5, 3])
        reviews.append({
            "id": _generate_id(f"gp_{i}_{text[:20]}"),
            "text": text,
            "rating": rating,
            "date": _random_date(start_date, now),
            "reviewer": reviewer.copy(),
            "helpful_votes": random.randint(2, 45),
            "title": random.choice(["Good product", "Worth buying", "Satisfied", "Nice quality", "Value for money"]),
        })

    # Generate genuine negative reviews (20%)
    genuine_negative_count = int(count * 0.2)
    for i in range(genuine_negative_count):
        reviewer = random.choice(GENUINE_REVIEWERS)
        template = random.choice(GENUINE_NEGATIVE_REVIEWS)
        text = _fill_template(template)
        rating = random.choice([1, 2, 2, 3])
        reviews.append({
            "id": _generate_id(f"gn_{i}_{text[:20]}"),
            "text": text,
            "rating": rating,
            "date": _random_date(start_date, now),
            "reviewer": reviewer.copy(),
            "helpful_votes": random.randint(5, 60),
            "title": random.choice(["Disappointed", "Not worth it", "Below average", "Could be better"]),
        })

    # Generate fake positive reviews (25%) - some in bursts
    fake_positive_count = int(count * 0.25)
    burst_date = now - timedelta(days=random.randint(30, 90))
    for i in range(fake_positive_count):
        reviewer = random.choice(SUSPICIOUS_REVIEWERS)
        text = random.choice(FAKE_POSITIVE_REVIEWS)
        # 60% of fake reviews come in bursts
        if i < fake_positive_count * 0.6:
            date = _random_date(burst_date - timedelta(days=2), burst_date + timedelta(days=2))
        else:
            date = _random_date(start_date, now)
        reviews.append({
            "id": _generate_id(f"fp_{i}_{text[:20]}"),
            "text": text,
            "rating": 5,
            "date": date,
            "reviewer": reviewer.copy(),
            "helpful_votes": random.randint(0, 3),
            "title": random.choice(["AMAZING!", "BEST PRODUCT!", "MUST BUY!", "PERFECT!", "LOVE IT!"]),
        })

    # Generate fake negative reviews (15%) - competitor attacks
    fake_negative_count = count - genuine_positive_count - genuine_negative_count - fake_positive_count
    attack_date = now - timedelta(days=random.randint(60, 150))
    for i in range(fake_negative_count):
        reviewer = random.choice(SUSPICIOUS_REVIEWERS)
        text = random.choice(FAKE_NEGATIVE_REVIEWS)
        if i < fake_negative_count * 0.5:
            date = _random_date(attack_date - timedelta(days=1), attack_date + timedelta(days=1))
        else:
            date = _random_date(start_date, now)
        reviews.append({
            "id": _generate_id(f"fn_{i}_{text[:20]}"),
            "text": text,
            "rating": 1,
            "date": date,
            "reviewer": reviewer.copy(),
            "helpful_votes": random.randint(0, 2),
            "title": random.choice(["TERRIBLE!", "SCAM!", "WORST EVER!", "AVOID!", "DO NOT BUY!"]),
        })

    random.shuffle(reviews)
    return reviews


# ─── Fake Review News Data ───────────────────────────────────────────────────

NEWS_DATA = [
    {
        "id": "news_1",
        "title": "Amazon Removes 200M+ Fake Reviews in 2024 Crackdown",
        "summary": "Amazon's latest transparency report reveals the platform removed over 200 million suspected fake reviews last year, a 45% increase from the previous year. The company used advanced ML models to detect coordinated review manipulation campaigns.",
        "source": "TechCrunch",
        "date": "2025-03-15",
        "category": "Platform Action",
        "impact": "high",
    },
    {
        "id": "news_2",
        "title": "Fake Review Farms Exposed: Inside the ₹500 Crore Industry",
        "summary": "An investigation reveals organized review farms operating across India and Southeast Asia, where workers are paid ₹20-50 per fake review. These operations target major e-commerce platforms and influence billions in consumer spending.",
        "source": "Reuters",
        "date": "2025-04-02",
        "category": "Investigation",
        "impact": "critical",
    },
    {
        "id": "news_3",
        "title": "New EU Regulations Target Fake Online Reviews",
        "summary": "The European Union has passed new digital marketplace regulations requiring platforms to verify reviewer identity and implement AI-based review authenticity checks. Non-compliance carries fines up to 6% of global revenue.",
        "source": "BBC News",
        "date": "2025-02-28",
        "category": "Regulation",
        "impact": "high",
    },
    {
        "id": "news_4",
        "title": "Major Smartphone Brand Caught in Fake Review Scandal",
        "summary": "A popular smartphone brand has been accused of orchestrating fake positive reviews for its latest flagship device. Researchers found that 40% of 5-star reviews showed signs of manipulation, including identical phrasing and suspicious reviewer accounts.",
        "source": "The Verge",
        "date": "2025-04-10",
        "category": "Brand Scandal",
        "impact": "critical",
    },
    {
        "id": "news_5",
        "title": "Flipkart Introduces Verified Purchase Badge System",
        "summary": "Flipkart has launched a new verified purchase badge system to combat fake reviews. Only reviews from confirmed buyers will display a green verification badge, helping consumers identify trustworthy feedback.",
        "source": "Economic Times",
        "date": "2025-03-20",
        "category": "Platform Action",
        "impact": "medium",
    },
    {
        "id": "news_6",
        "title": "AI-Generated Reviews: The New Frontier of Online Fraud",
        "summary": "Security researchers warn that large language models are being used to generate increasingly sophisticated fake reviews that are harder for both humans and traditional algorithms to detect. The reviews mimic natural language patterns and include specific product details.",
        "source": "Wired",
        "date": "2025-04-18",
        "category": "Emerging Threat",
        "impact": "critical",
    },
]
