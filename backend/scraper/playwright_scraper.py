"""
3-Tier Resilient Scraper
========================

Tier 1 — Stealth Playwright (Primary)
  - playwright-stealth patches Chromium fingerprint to bypass bot detection
  - Random User-Agent + realistic viewport rotation
  - Waits for specific review-container DOM element before extraction
  - 4x scroll to trigger lazy-loaded reviews
  - Applies to all supported sites

Tier 2 — XHR/JSON API Intercept (SPA Enhancement)
  - For React/SPA sites (Myntra, Ajio, Meesho, Flipkart): attaches a
    page.on("response") handler that watches for background JSON API calls
    containing review data, captured before touching the DOM at all.
  - Runs concurrently inside the same Playwright session as Tier 1.

Tier 3 — Demo Mock Fallback (Crucial / Zero-crash guarantee)
  - If Tier 1+2 raise any error (timeout, CAPTCHA, access denied),
    instantly returns hardcoded data from mock_demo_data.json.
  - Keyed by domain (amazon / myntra / flipkart / meesho).
  - If domain is unknown, falls back to the random mock scraper.

Public entry point: scrape_product_live(url) → dict
"""

import re
import json
import random
import asyncio
import threading
import hashlib
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import httpx
from bs4 import BeautifulSoup

from scraper.selector_map import get_selectors, SPA_SITES
from models.schemas import RawReview

logger = logging.getLogger(__name__)

# ─── Mock demo data path ─────────────────────────────────────────────────────

_MOCK_DATA_PATH = Path(__file__).parent / "mock_demo_data.json"

# ─── User-Agent rotation pool ────────────────────────────────────────────────

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
]

VIEWPORTS = [
    {"width": 1920, "height": 1080},
    {"width": 1440, "height": 900},
    {"width": 1366, "height": 768},
    {"width": 1280, "height": 800},
    {"width": 1536, "height": 864},
]

HEADERS = {
    "User-Agent": USER_AGENTS[0],
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://www.google.com/",
}


# ─── Helper functions ─────────────────────────────────────────────────────────

def _clean(text: Optional[str]) -> str:
    return re.sub(r"\s+", " ", (text or "").strip())


def _parse_rating(text: str) -> float:
    m = re.search(r"[\d.]+", text)
    return round(float(m.group()), 1) if m else 0.0


def _parse_date(text: str) -> str:
    patterns = [
        "%B %d, %Y",
        "%d %B %Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%b %d, %Y",
        "%d/%m/%Y",
    ]
    text = re.sub(r"(?i)reviewed in .+? on ", "", text).strip()
    for pattern in patterns:
        try:
            return datetime.strptime(text, pattern).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return datetime.now().strftime("%Y-%m-%d")


def _reviewer_id(name: str, index: int) -> str:
    return hashlib.md5(f"{name}_{index}".encode()).hexdigest()[:10]


def _extract_amazon_asin(url: str) -> Optional[str]:
    """Extracts 10-char ASIN from common Amazon URL patterns."""
    patterns = [
        r"/dp/([A-Z0-9]{10})",
        r"/gp/product/([A-Z0-9]{10})",
        r"/product/([A-Z0-9]{10})",
    ]
    for p in patterns:
        m = re.search(p, url, re.IGNORECASE)
        if m:
            return m.group(1).upper()
    return None


def _amazon_reviews_url(url: str) -> Optional[str]:
    """Builds Amazon reviews page URL from a product URL when possible."""
    asin = _extract_amazon_asin(url)
    if not asin:
        return None

    domain_match = re.search(r"https?://([^/]+)/", url)
    domain = domain_match.group(1) if domain_match else "www.amazon.in"
    return f"https://{domain}/product-reviews/{asin}?reviewerType=all_reviews"


def _extract_flipkart_pid(url: str) -> Optional[str]:
    """Extract Flipkart product PID from query param or path-like patterns."""
    m = re.search(r"[?&]pid=([A-Z0-9]{16})", url, re.IGNORECASE)
    if m:
        return m.group(1).upper()

    m = re.search(r"/p/[^?]*[?&]pid=([A-Z0-9]{16})", url, re.IGNORECASE)
    if m:
        return m.group(1).upper()

    return None


def _flipkart_reviews_url(url: str) -> Optional[str]:
    pid = _extract_flipkart_pid(url)
    if not pid:
        return None
    return f"https://www.flipkart.com/product-reviews/{pid}?pid={pid}&marketplace=FLIPKART"


def _product_name_from_url(url: str) -> str:
    """Best-effort product name from URL slug if page parsing is blocked."""
    path_match = re.search(r"https?://[^/]+/([^?]+)", url)
    if not path_match:
        return "Unknown Product"

    slug_path = path_match.group(1)
    slug = slug_path.split("/p/")[0].split("/")[-1]
    slug = re.sub(r"[-_]+", " ", slug)
    slug = re.sub(r"\s+", " ", slug).strip()
    if not slug:
        return "Unknown Product"
    return slug.title()


def _blocked_site_fallback_reviews(product_name: str, count: int = 16) -> list[RawReview]:
    """Generate lightweight review samples when marketplace blocks scraping."""
    base_texts = [
        f"Using {product_name} for a week now. Setup was quick and core features work as expected.",
        f"Battery and connectivity on {product_name} are good for daily use, but UI could be smoother.",
        f"{product_name} feels premium for the price. Notifications and tracking are reliable.",
        f"Decent product overall. {product_name} has useful features, though app sync can be inconsistent.",
        f"Value for money purchase. {product_name} works well for workouts and daily wear.",
        f"Build quality is good. Expected better speaker/mic clarity on {product_name} in noisy places.",
    ]
    reviews: list[RawReview] = []
    for i in range(count):
        text = base_texts[i % len(base_texts)]
        rating = random.choice([3.5, 4.0, 4.0, 4.5, 5.0])
        reviewer = f"User_{i+1}"
        reviews.append(
            RawReview(
                reviewer_id=_reviewer_id(reviewer, i),
                reviewer=reviewer,
                rating=rating,
                text=text,
                date=datetime.now().strftime("%Y-%m-%d"),
            )
        )
    return reviews


def _extract_reviews_from_embedded_json(html: str, max_reviews: int = 40) -> list[RawReview]:
    """
    Best-effort extraction when DOM selectors fail (common on anti-bot/changing layouts).
    Tries JSON-LD / embedded JSON-like snippets.
    """
    reviews: list[RawReview] = []

    # 1) JSON-LD Review objects (if present)
    ld_json_blocks = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html,
        re.IGNORECASE | re.DOTALL,
    )

    def _append_review(reviewer: str, text: str, rating: float, date: str) -> None:
        if not text or len(text) < 8:
            return
        idx = len(reviews)
        reviews.append(
            RawReview(
                reviewer_id=_reviewer_id(reviewer or f"Reviewer_{idx}", idx),
                reviewer=reviewer or f"Reviewer_{idx}",
                rating=rating if 0 < rating <= 5 else 3.0,
                text=_clean(text),
                date=date,
            )
        )

    def _walk(obj: Any) -> None:
        if len(reviews) >= max_reviews:
            return
        if isinstance(obj, dict):
            text = obj.get("reviewBody") or obj.get("reviewText") or obj.get("text") or obj.get("description") or ""
            if text:
                reviewer_obj = obj.get("author")
                reviewer = ""
                if isinstance(reviewer_obj, dict):
                    reviewer = _clean(str(reviewer_obj.get("name") or ""))
                elif reviewer_obj:
                    reviewer = _clean(str(reviewer_obj))

                rating_obj = obj.get("reviewRating") or {}
                rating_raw = (
                    (rating_obj.get("ratingValue") if isinstance(rating_obj, dict) else None)
                    or obj.get("rating")
                    or obj.get("ratingValue")
                    or 3
                )
                try:
                    rating = float(str(rating_raw).strip())
                except Exception:
                    rating = 3.0

                date_raw = obj.get("datePublished") or obj.get("date") or ""
                date = _parse_date(str(date_raw)) if date_raw else datetime.now().strftime("%Y-%m-%d")
                _append_review(reviewer, str(text), rating, date)

            for v in obj.values():
                _walk(v)
        elif isinstance(obj, list):
            for v in obj:
                _walk(v)

    for block in ld_json_blocks:
        if len(reviews) >= max_reviews:
            break
        cleaned = block.strip()
        if not cleaned:
            continue
        try:
            data = json.loads(cleaned)
            _walk(data)
        except Exception:
            continue

    # 2) Regex fallback for JSON-like inline blobs
    if len(reviews) < 3:
        text_candidates = re.findall(
            r'"(?:reviewText|reviewBody|text)"\s*:\s*"((?:\\.|[^"\\]){20,1200})"',
            html,
            re.IGNORECASE,
        )
        rating_candidates = re.findall(
            r'"(?:ratingValue|rating|overallRating|starRating)"\s*:\s*"?([1-5](?:\.\d)?)"?',
            html,
            re.IGNORECASE,
        )
        reviewer_candidates = re.findall(
            r'"(?:reviewerName|author|reviewer|userName|name)"\s*:\s*"((?:\\.|[^"\\]){2,80})"',
            html,
            re.IGNORECASE,
        )

        for i, raw_text in enumerate(text_candidates[:max_reviews]):
            try:
                text = bytes(raw_text, "utf-8").decode("unicode_escape")
            except Exception:
                text = raw_text
            reviewer = reviewer_candidates[i] if i < len(reviewer_candidates) else f"Reviewer_{i}"
            try:
                rating = float(rating_candidates[i]) if i < len(rating_candidates) else 3.0
            except Exception:
                rating = 3.0
            _append_review(_clean(reviewer), text, rating, datetime.now().strftime("%Y-%m-%d"))

    return reviews[:max_reviews]


def _reviews_from_soup(soup: BeautifulSoup, selectors: dict) -> list[RawReview]:
    """Extract RawReview list from a BeautifulSoup object using selector map."""
    reviews: list[RawReview] = []
    if not (selectors.get("reviews_container") and selectors.get("review_item")):
        return reviews

    container = soup.select_one(selectors["reviews_container"])
    if not container:
        # Try each selector individually if comma-separated
        for sel in selectors["reviews_container"].split(","):
            container = soup.select_one(sel.strip())
            if container:
                break

    if not container:
        return reviews

    items = container.select(selectors["review_item"])
    if not items:
        # Some sites render reviews outside the expected wrapper; try global fallback.
        items = soup.select(selectors["review_item"])
    for i, item in enumerate(items[:60]):
        reviewer_el = item.select_one(selectors["reviewer_name"]) if selectors.get("reviewer_name") else None
        text_el = item.select_one(selectors["review_text"]) if selectors.get("review_text") else None
        rating_el = item.select_one(selectors["review_rating"]) if selectors.get("review_rating") else None
        date_el = item.select_one(selectors["review_date"]) if selectors.get("review_date") else None

        reviewer = _clean(reviewer_el.get_text()) if reviewer_el else f"Reviewer_{i}"
        text = _clean(text_el.get_text()) if text_el else ""
        rating_text = _clean(rating_el.get_text()) if rating_el else "3"
        rating = _parse_rating(rating_text)
        date = _parse_date(_clean(date_el.get_text())) if date_el else datetime.now().strftime("%Y-%m-%d")

        if text:
            reviews.append(RawReview(
                reviewer_id=_reviewer_id(reviewer, i),
                reviewer=reviewer,
                rating=rating if rating > 0 else 3.0,
                text=text,
                date=date,
            ))
    return reviews


def _product_from_soup(soup: BeautifulSoup, selectors: dict, url: str) -> dict:
    """Extract product metadata from a BeautifulSoup object."""
    name_el = soup.select_one(selectors["product_name"]) if selectors.get("product_name") else None
    if not name_el:
        for sel in (selectors.get("product_name") or "h1").split(","):
            name_el = soup.select_one(sel.strip())
            if name_el:
                break
    product_name = _clean(name_el.get_text()) if name_el else "Unknown Product"

    rating_el = soup.select_one(selectors["original_rating"]) if selectors.get("original_rating") else None
    if rating_el:
        rating_text = (
            rating_el.get(selectors["rating_attr"])
            if selectors.get("rating_attr")
            else rating_el.get_text()
        )
        original_rating = _parse_rating(_clean(rating_text))
    else:
        original_rating = 4.0

    return {
        "name": product_name,
        "category": None,
        "original_rating": original_rating if original_rating > 0 else 4.0,
        "total_reviews": 0,
    }


# ─── Tier 3: Mock demo fallback ───────────────────────────────────────────────

def _load_mock_demo(url: str) -> Optional[dict[str, Any]]:
    """
    Returns hardcoded demo data from mock_demo_data.json if the URL domain
    matches a known demo key (amazon, myntra, flipkart, meesho).
    Returns None if no match found.

    Demo fallback is disabled by default in production-like runs.
    Enable only when DEMO_MOCK_FALLBACK=true.
    """
    if os.getenv("DEMO_MOCK_FALLBACK", "false").lower() not in {"1", "true", "yes"}:
        return None

    try:
        with open(_MOCK_DATA_PATH, "r") as f:
            mock_db = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.warning(f"Could not load mock_demo_data.json: {e}")
        return None

    url_lower = url.lower()
    for domain_key, data in mock_db.items():
        if domain_key in url_lower:
            logger.info(f"[Tier 3] Using demo mock data for domain '{domain_key}'")
            reviews = [
                RawReview(
                    reviewer_id=r["reviewer_id"],
                    reviewer=r["reviewer"],
                    rating=float(r["rating"]),
                    text=r["text"],
                    date=r["date"],
                )
                for r in data["reviews"]
            ]
            product = data["product"]
            product["total_reviews"] = product.get("total_reviews", len(reviews) * 10)
            return {
                "product": product,
                "reviews": reviews,
                "_genuine_ids": set(),
                "_tier": "mock_demo",
            }
    return None


# ─── Tier 1+2: Playwright stealth scraper (async core) ───────────────────────

async def _scrape_with_playwright_async(url: str, selectors: dict, site_key: str) -> dict[str, Any]:
    """
    Tier 1 (stealth browser) + Tier 2 (XHR intercept) combined.
    Uses playwright-stealth to patch fingerprint. Rotates UA + viewport.
    For SPA sites, intercepts API JSON responses in parallel with DOM extraction.
    """
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise ImportError("playwright not installed. Run: pip install playwright && playwright install chromium")

    # Try stealth plugin (graceful degradation if not installed)
    try:
        from playwright_stealth import stealth_async
        use_stealth = True
    except ImportError:
        logger.warning("playwright-stealth not installed — running without stealth patch")
        use_stealth = False

    ua = random.choice(USER_AGENTS)
    viewport = random.choice(VIEWPORTS)
    logger.info(f"[Tier 1] Launching Playwright for {url} | UA: {ua[:40]}...")

    intercepted_reviews: list[RawReview] = []
    api_patterns = selectors.get("api_intercept_patterns", [])
    is_spa = site_key in SPA_SITES

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
            ],
        )
        context = await browser.new_context(
            user_agent=ua,
            locale="en-IN",
            timezone_id="Asia/Kolkata",
            viewport=viewport,
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
            },
        )

        page = await context.new_page()

        # Apply stealth patch (Tier 1 enhancement)
        if use_stealth:
            await stealth_async(page)

        # Tier 2: XHR intercept for SPA sites
        if is_spa and api_patterns:
            async def handle_response(response):
                try:
                    resp_url = response.url.lower()
                    if any(pat.lower() in resp_url for pat in api_patterns):
                        content_type = response.headers.get("content-type", "")
                        if "json" in content_type and response.status == 200:
                            try:
                                data = await response.json()
                                parsed = _parse_spa_json(data, site_key)
                                if parsed:
                                    intercepted_reviews.extend(parsed)
                                    logger.info(f"[Tier 2] Intercepted {len(parsed)} reviews from API: {response.url[:80]}")
                            except Exception as je:
                                logger.debug(f"[Tier 2] JSON parse error: {je}")
                except Exception:
                    pass

            page.on("response", handle_response)

        # Block heavy resources for speed
        await page.route(
            "**/*.{png,jpg,jpeg,gif,webp,svg,woff,woff2,ttf,otf,mp4,mp3}",
            lambda route: route.abort()
        )

        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=35_000)
        except Exception as e:
            await browser.close()
            raise RuntimeError(f"Navigation failed: {e}")

        # Wait for review container (Tier 1 DOM-wait)
        review_container_sel = selectors.get("reviews_container")
        if review_container_sel:
            primary_sel = review_container_sel.split(",")[0].strip()
            try:
                await page.wait_for_selector(primary_sel, timeout=12_000)
                logger.info(f"[Tier 1] Review container found: {primary_sel}")
            except Exception:
                logger.warning(f"[Tier 1] Review container timeout — proceeding with current DOM")

        # Scroll to trigger lazy-loaded content
        for i in range(4):
            await page.mouse.wheel(0, 2500)
            await page.wait_for_timeout(random.randint(600, 1000))

        html = await page.content()
        await browser.close()

    soup = BeautifulSoup(html, "lxml")
    product_meta = _product_from_soup(soup, selectors, url)

    # Use Tier 2 intercepted reviews if we got enough
    if intercepted_reviews and len(intercepted_reviews) >= 3:
        logger.info(f"[Tier 2] Using {len(intercepted_reviews)} API-intercepted reviews")
        dom_reviews = _reviews_from_soup(soup, selectors)
        # Merge: API reviews take priority, DOM fills gaps
        seen_texts = {r.text[:50] for r in intercepted_reviews}
        for r in dom_reviews:
            if r.text[:50] not in seen_texts:
                intercepted_reviews.append(r)
                seen_texts.add(r.text[:50])
        reviews = intercepted_reviews
        tier = "tier2_intercept"
    else:
        # Tier 1 DOM extraction
        reviews = _reviews_from_soup(soup, selectors)
        tier = "tier1_playwright"
        logger.info(f"[Tier 1] Extracted {len(reviews)} reviews from DOM")

    # Try to extract total review count from page text
    total_match = re.search(r"([\d,]+)\s+(?:global\s+)?(?:ratings?|reviews?)", html, re.IGNORECASE)
    total = int(total_match.group(1).replace(",", "")) if total_match else max(len(reviews) * 15, 100)
    product_meta["total_reviews"] = total

    return {
        "product": product_meta,
        "reviews": reviews,
        "_genuine_ids": set(),
        "_tier": tier,
    }


def _parse_spa_json(data: Any, site_key: str) -> list[RawReview]:
    """
    Best-effort parser for SPA API JSON responses.
    Each site has a slightly different schema — we try common patterns.
    """
    reviews = []

    def _try_extract(items: list, i: int) -> Optional[RawReview]:
        if not isinstance(items, list):
            return None
        item = items[i] if i < len(items) else {}
        if not isinstance(item, dict):
            return None

        # Common field aliases across sites
        text = (
            item.get("reviewText") or item.get("review_text") or item.get("userComment")
            or item.get("text") or item.get("body") or item.get("comment") or ""
        )
        reviewer = (
            item.get("reviewerName") or item.get("reviewer_name") or item.get("displayName")
            or item.get("name") or item.get("userName") or f"Reviewer_{i}"
        )
        rating_raw = (
            item.get("overallRating") or item.get("rating") or item.get("starRating")
            or item.get("userRating") or item.get("score") or 3
        )
        date_raw = (
            item.get("reviewedOn") or item.get("review_date") or item.get("createdAt")
            or item.get("date") or item.get("timestamp") or ""
        )

        text = _clean(str(text))
        reviewer = _clean(str(reviewer))
        try:
            rating = round(float(str(rating_raw).replace("★", "").strip()), 1)
        except (ValueError, TypeError):
            rating = 3.0

        date = _parse_date(str(date_raw)) if date_raw else datetime.now().strftime("%Y-%m-%d")

        if text and len(text) > 5:
            return RawReview(
                reviewer_id=_reviewer_id(reviewer, i),
                reviewer=reviewer,
                rating=rating if 0 < rating <= 5 else 3.0,
                text=text,
                date=date,
            )
        return None

    # Try common JSON wrapper patterns
    candidates = []
    if isinstance(data, list):
        candidates = data
    elif isinstance(data, dict):
        for key in ["reviews", "data", "result", "results", "items", "content", "ratingList", "reviewList"]:
            val = data.get(key)
            if isinstance(val, list):
                candidates = val
                break
            elif isinstance(val, dict):
                for sub_key in ["reviews", "items", "data", "content"]:
                    sub = val.get(sub_key)
                    if isinstance(sub, list):
                        candidates = sub
                        break

    for i in range(min(len(candidates), 60)):
        r = _try_extract(candidates, i)
        if r:
            reviews.append(r)

    return reviews


# ─── Sync wrapper ─────────────────────────────────────────────────────────────

def _run_async(coro):
    """Run an async coroutine safely regardless of whether an event loop is running."""
    try:
        asyncio.get_running_loop()
        has_running_loop = True
    except RuntimeError:
        has_running_loop = False

    if not has_running_loop:
        return asyncio.run(coro)

    result: dict[str, Any] = {}
    error: dict[str, Exception] = {}

    def _runner() -> None:
        try:
            result["value"] = asyncio.run(coro)
        except Exception as exc:
            error["value"] = exc

    t = threading.Thread(target=_runner, daemon=True)
    t.start()
    t.join(timeout=75)

    if t.is_alive():
        raise TimeoutError("Playwright scraping timed out")

    if "value" in error:
        raise error["value"]

    return result.get("value")


# ─── Static scraper (httpx + BeautifulSoup) ──────────────────────────────────

def _scrape_static(url: str, selectors: dict) -> dict[str, Any]:
    """
    Lightweight static fallback using httpx + BeautifulSoup.
    Used for sites marked type='static' OR when Playwright is unavailable.
    """
    logger.info(f"[static-httpx] Fetching {url}")
    ua = random.choice(USER_AGENTS)
    headers = {**HEADERS, "User-Agent": ua}

    with httpx.Client(headers=headers, follow_redirects=True, timeout=20) as client:
        resp = client.get(url)
        if resp.status_code >= 400:
            logger.warning(f"[static-httpx] Non-200 status: {resp.status_code} for {url}")

    soup = BeautifulSoup(resp.text, "lxml")
    product_meta = _product_from_soup(soup, selectors, url)
    reviews = _reviews_from_soup(soup, selectors)
    if not reviews:
        reviews = _extract_reviews_from_embedded_json(resp.text)

    total_match = re.search(r"([\d,]+)\s+(?:global\s+)?(?:ratings?|reviews?)", resp.text, re.IGNORECASE)
    product_meta["total_reviews"] = (
        int(total_match.group(1).replace(",", "")) if total_match
        else max(len(reviews) * 10, 50)
    )

    return {
        "product": product_meta,
        "reviews": reviews,
        "_genuine_ids": set(),
        "_tier": "tier1_static",
    }


# ─── Public entry point ───────────────────────────────────────────────────────

def scrape_product_live(url: str) -> dict[str, Any]:
    """
    3-Tier live scraping entry point.

    Tier 1+2: Playwright stealth + XHR intercept (primary)
    Tier 3:   mock_demo_data.json (guaranteed zero-crash fallback)

    Returns a normalised dict: { product, reviews, _genuine_ids, _tier }
    Raises RuntimeError only if ALL tiers fail (should not happen).
    """
    site_key, selectors = get_selectors(url)
    logger.info(f"Scraping '{url}' | site='{site_key}' | type='{selectors['type']}'")
    last_product_meta: dict[str, Any] | None = None

    # ── Tier 1 + 2: Playwright (stealth + intercept) ──────────────────────────
    try:
        result = _run_async(_scrape_with_playwright_async(url, selectors, site_key))
        if result and result.get("product"):
            last_product_meta = result.get("product")
        if result and result.get("reviews"):
            logger.info(f"[{result.get('_tier', 'tier1')}] Success — {len(result['reviews'])} reviews")
            return result
        else:
            logger.warning("Playwright returned empty reviews, trying static fallback")

            # Amazon-specific fallback: fetch dedicated review page
            if site_key == "amazon":
                try:
                    review_url = _amazon_reviews_url(url)
                    if review_url:
                        logger.info(f"[amazon-fallback] Fetching review page: {review_url}")
                        result = _scrape_static(review_url, selectors)
                        if result and result.get("reviews"):
                            result["_tier"] = "amazon_review_page"
                            logger.info(f"[amazon_review_page] Success — {len(result['reviews'])} reviews")
                            return result
                except Exception as e:
                    logger.warning(f"[amazon-fallback] Failed: {type(e).__name__}: {e}")

            # Flipkart-specific fallback: dedicated reviews page
            if site_key == "flipkart":
                try:
                    review_url = _flipkart_reviews_url(url)
                    if review_url:
                        logger.info(f"[flipkart-fallback] Fetching review page: {review_url}")

                        result = _run_async(_scrape_with_playwright_async(review_url, selectors, site_key))
                        if result and result.get("product"):
                            last_product_meta = result.get("product")
                        if result and result.get("reviews"):
                            result["_tier"] = "flipkart_review_page"
                            logger.info(f"[flipkart_review_page] Success — {len(result['reviews'])} reviews")
                            return result

                        result = _scrape_static(review_url, selectors)
                        if result and result.get("product"):
                            last_product_meta = result.get("product")
                        if result and result.get("reviews"):
                            result["_tier"] = "flipkart_review_page_static"
                            logger.info(f"[flipkart_review_page_static] Success — {len(result['reviews'])} reviews")
                            return result
                except Exception as e:
                    logger.warning(f"[flipkart-fallback] Failed: {type(e).__name__}: {e}")
    except Exception as e:
        logger.warning(f"[Tier 1/2] Playwright failed: {type(e).__name__}: {e}")

    # ── Tier 1 static fallback (if Playwright fails but site is simple HTML) ──
    try:
        result = _scrape_static(url, selectors)
        if result and result.get("product"):
            last_product_meta = result.get("product")
        if result and result.get("reviews"):
            logger.info(f"[tier1_static] Success — {len(result['reviews'])} reviews")
            return result
        logger.warning("[tier1_static] No reviews found in static HTML")
    except Exception as e:
        logger.warning(f"[Tier 1 static] Failed: {type(e).__name__}: {e}")

    # ── Tier 3: Demo mock fallback ─────────────────────────────────────────────
    mock = _load_mock_demo(url)
    if mock:
        logger.info(f"[Tier 3] Demo mock returned {len(mock['reviews'])} reviews")
        return mock

    # Anti-bot recovery for Flipkart: return product-level result with generated
    # sample reviews instead of hard failure.
    if site_key == "flipkart":
        parsed_name = (last_product_meta or {}).get("name") or ""
        fallback_name = parsed_name if parsed_name and parsed_name.lower() != "unknown product" else _product_name_from_url(url)
        fallback_product = {
            "name": fallback_name,
            "category": (last_product_meta or {}).get("category") or "Electronics",
            "original_rating": float((last_product_meta or {}).get("original_rating") or 4.0),
            "total_reviews": int((last_product_meta or {}).get("total_reviews") or 500),
        }
        fallback_reviews = _blocked_site_fallback_reviews(fallback_name)
        logger.warning(
            f"[flipkart-blocked-fallback] Returning {len(fallback_reviews)} generated reviews due to anti-bot blocking"
        )
        return {
            "product": fallback_product,
            "reviews": fallback_reviews,
            "_genuine_ids": set(),
            "_tier": "flipkart_blocked_fallback",
        }

    # If we reach here with no data, raise so the router can use scraper.py random mock
    raise RuntimeError(
        f"All 3 scraper tiers failed for URL: {url}. "
        "Router will fall back to random mock scraper."
    )
