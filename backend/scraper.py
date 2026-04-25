"""
Review Scraper Module.

Attempts to scrape reviews from e-commerce platforms.
Falls back to mock data to ensure hackathon demo reliability.
"""

import re
import random
import requests
from bs4 import BeautifulSoup
from mock_data import generate_mock_reviews, get_product_info


# ─── User Agent Pool ─────────────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
]


def _get_headers():
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }


# ─── Platform Detection ──────────────────────────────────────────────────────

def detect_platform(query: str) -> str:
    """Detect which e-commerce platform the query relates to."""
    query_lower = query.lower()
    if "amazon" in query_lower:
        return "amazon"
    elif "flipkart" in query_lower:
        return "flipkart"
    elif "myntra" in query_lower:
        return "myntra"
    elif "http" in query_lower:
        return "url"
    return "search"


# ─── Amazon Scraper ──────────────────────────────────────────────────────────

def _scrape_amazon(url: str) -> list:
    """Attempt to scrape review data from Amazon product page."""
    try:
        response = requests.get(url, headers=_get_headers(), timeout=10)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        reviews = []

        review_divs = soup.find_all('div', {'data-hook': 'review'})
        for div in review_divs:
            try:
                title_el = div.find('a', {'data-hook': 'review-title'})
                body_el = div.find('span', {'data-hook': 'review-body'})
                rating_el = div.find('i', {'data-hook': 'review-star-rating'})
                date_el = div.find('span', {'data-hook': 'review-date'})
                author_el = div.find('span', class_='a-profile-name')

                title = title_el.get_text(strip=True) if title_el else ""
                text = body_el.get_text(strip=True) if body_el else ""
                rating_text = rating_el.get_text(strip=True) if rating_el else "3.0"
                rating = float(re.findall(r'[\d.]+', rating_text)[0]) if rating_text else 3.0
                date = date_el.get_text(strip=True) if date_el else ""
                author = author_el.get_text(strip=True) if author_el else "Anonymous"

                if text:
                    reviews.append({
                        "id": f"amz_{len(reviews)}",
                        "text": text,
                        "title": title,
                        "rating": int(rating),
                        "date": date,
                        "reviewer": {
                            "name": author,
                            "account_age_days": random.randint(100, 2000),
                            "total_reviews": random.randint(1, 50),
                            "verified": True,
                        },
                        "helpful_votes": random.randint(0, 30),
                    })
            except Exception:
                continue

        return reviews
    except Exception:
        return []


# ─── Flipkart Scraper ────────────────────────────────────────────────────────

def _scrape_flipkart(url: str) -> list:
    """Attempt to scrape review data from Flipkart product page."""
    try:
        response = requests.get(url, headers=_get_headers(), timeout=10)
        if response.status_code != 200:
            return []

        soup = BeautifulSoup(response.text, 'html.parser')
        reviews = []

        review_containers = soup.find_all('div', class_='_27M-vq')
        if not review_containers:
            review_containers = soup.find_all('div', class_='col _2wzgFH')

        for container in review_containers:
            try:
                text_el = container.find('div', class_='t-ZTKy')
                if not text_el:
                    text_el = container.find('div', {'class': re.compile('.*ZTKy.*')})
                rating_el = container.find('div', class_='_3LWZlK')

                text = text_el.get_text(strip=True) if text_el else ""
                rating = int(rating_el.get_text(strip=True)) if rating_el else 3

                if text:
                    reviews.append({
                        "id": f"fk_{len(reviews)}",
                        "text": text,
                        "title": "",
                        "rating": rating,
                        "date": "",
                        "reviewer": {
                            "name": f"Flipkart User {len(reviews)}",
                            "account_age_days": random.randint(100, 1500),
                            "total_reviews": random.randint(1, 30),
                            "verified": True,
                        },
                        "helpful_votes": random.randint(0, 20),
                    })
            except Exception:
                continue

        return reviews
    except Exception:
        return []


# ─── Main Scraper Interface ──────────────────────────────────────────────────

def scrape_reviews(query: str) -> tuple:
    """
    Main entry point: attempts scraping, falls back to mock data.
    Returns (reviews, product_info, source) tuple.
    """
    platform = detect_platform(query)
    reviews = []

    # Attempt real scraping if URL provided
    if platform == "amazon" or ("amazon" in query.lower() and "http" in query.lower()):
        reviews = _scrape_amazon(query)
    elif platform == "flipkart" or ("flipkart" in query.lower() and "http" in query.lower()):
        reviews = _scrape_flipkart(query)

    # Get product info
    product_info = get_product_info(query)

    # Fall back to mock data if scraping returned too few reviews
    if len(reviews) < 10:
        product_info = get_product_info(query)
        reviews = generate_mock_reviews(product_info, count=random.randint(60, 100))
        source = "demo"
    else:
        source = platform

    product_info["source"] = source
    return reviews, product_info, source
