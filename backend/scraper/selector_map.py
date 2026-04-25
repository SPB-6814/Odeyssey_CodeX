"""
Selector Map — single config file for all site-specific CSS selectors.

Strategy: if a site changes its HTML structure, ONLY this file needs updating.
Each site entry is keyed by a domain substring that will be matched against
the input URL using `domain in url`.

Fields per site:
  - type: "static" (httpx + BS4) | "dynamic" (Playwright headless browser)
  - product_name: CSS selector for the product title
  - original_rating: CSS selector for the aggregate star rating
  - reviews_container: CSS selector wrapping all individual reviews
  - review_item: selector for a single review card (relative to container)
  - reviewer_name: selector for reviewer display name (relative to review_item)
  - review_text: selector for the review body text (relative to review_item)
  - review_rating: selector for the star rating within the review (relative to review_item)
  - review_date: selector for the review date string (relative to review_item)
  - verified_badge: selector for the "Verified Purchase" badge (relative to review_item)
  - image_url: selector for review-attached image (optional, relative to review_item)
  - next_page: selector for the "Next page" pagination button (Playwright only)
  - rating_attr: if set, extract from attribute instead of text (e.g. "data-a-score")
  - api_intercept_patterns: list of URL substrings to watch in XHR/Fetch responses (Tier 2)
"""

SELECTOR_MAP: dict = {

    # ─── Amazon ─────────────────────────────────────────────────────────────
    "amazon": {
        "type": "dynamic",
        "product_name": "#productTitle",
        "original_rating": "span[data-hook='rating-out-of-text']",
        "reviews_container": "#cm-cr-dp-review-list",
        "review_item": "[data-hook='review']",
        "reviewer_name": "span.a-profile-name",
        "review_text": "span[data-hook='review-body'] > span, span[data-hook='review-body']",
        "review_rating": "i[data-hook='review-star-rating'] > span.a-offscreen",
        "review_date": "span[data-hook='review-date']",
        "verified_badge": "span[data-hook='avp-badge']",
        "image_url": "img[data-hook='review-image-tile']",
        "next_page": None,
        "rating_attr": None,
        "api_intercept_patterns": ["customer-reviews", "reviews/api"],
    },

    # ─── Flipkart ────────────────────────────────────────────────────────────
    "flipkart": {
        "type": "dynamic",
        "product_name": "span.VU-ZEz, h1[class*='yhB1nd'], span[class*='B_NuCI'], div[class*='row']>div>div>div>h1",
        "original_rating": "div.XQDdHH, div[class*='3LWZlK'], span[class*='Tponton'] div",
        "reviews_container": "div.col.EPCmJX.Ma1fCG, div[class*='RatingStats'], section[class*='_1YokD2'], div[class*='col-12-12']",
        "review_item": "div[class*='RcXBOT'], div[class*='EKFha-'], div[class*='col-9-12'], div[class*='ZmyHeo'], div[class*='t-ZTKy']",
        "reviewer_name": "p[class*='_2sc7ZR'], p[class*='_2V5EHH'], p[class*='WzMLSn']",
        "review_text": "div[class*='t-ZTKy'], div[class*='ZmyHeo'], p[class*='Zh4UK1'], div[class*='review-text']",
        "review_rating": "div[class*='3LWZlK'], div[class*='iSIvHK']",
        "review_date": "p[class*='_2sc7ZR']:not([class*='_2V5EHH'])",
        "verified_badge": "p[class*='_2mcZGG']",
        "image_url": "img[class*='_2j3RFt']",
        "next_page": "a[class*='_1LKTO3'], nav[class*='_2MImiq'] a:last-child",
        "rating_attr": None,
        "api_intercept_patterns": [
            "api.flipkart.com/api/3/product/reviews",
            "/api/3/product",
            "reviews?",
        ],
    },

    # ─── Meesho ──────────────────────────────────────────────────────────────
    "meesho": {
        "type": "dynamic",
        "product_name": "div[class*='ProductTitle'] h1, p[class*='ProductTitle']",
        "original_rating": "p[class*='ProductDetailCard'] span[class*='Text'], div[class*='RatingWidget'] p",
        "reviews_container": "div[class*='ReviewsSection'], div[class*='ReviewList']",
        "review_item": "div[class*='ReviewCard'], div[class*='ReviewContainer']",
        "reviewer_name": "p[class*='reviewerName'], p[class*='Name']",
        "review_text": "p[class*='reviewBody'], p[class*='ReviewText'], p[class*='reviewDescription']",
        "review_rating": "span[class*='ratingValue'], p[class*='Rating']",
        "review_date": "p[class*='reviewDate'], p[class*='Date']",
        "verified_badge": "span[class*='verifiedBadge'], p[class*='Verified']",
        "image_url": "img[class*='reviewImage']",
        "next_page": "button[class*='paginationNext'], button[aria-label='Next']",
        "rating_attr": None,
        "api_intercept_patterns": [
            "/v2/reviews",
            "/product-reviews",
            "meesho.com/api",
            "/consumer/listing/",
        ],
    },

    # ─── Myntra ──────────────────────────────────────────────────────────────
    "myntra": {
        "type": "dynamic",
        "product_name": "h1.pdp-name, h1.pdp-title, div[class*='pdp-name'], h1[class*='pdp']",
        "original_rating": "div.index-overallRating > div, div[class*='overallRating'] span",
        "reviews_container": "div.user-review-userReviewWrapper, div[class*='userReview']",
        "review_item": "div.user-review-reviewEntry, div[class*='reviewEntry']",
        "reviewer_name": "div.user-review-left > div, span[class*='reviewAuthor']",
        "review_text": "div.user-review-reviewTextWrapper > p, div[class*='reviewText'] p",
        "review_rating": "span.user-review-starRating > span, div[class*='starRating'] span",
        "review_date": "div.user-review-reviewDate, span[class*='reviewDate']",
        "verified_badge": "span.user-review-verifiedBuyer, span[class*='verifiedBuyer']",
        "image_url": "img.user-review-reviewImage",
        "next_page": "li.pagination-next > a",
        "rating_attr": None,
        "api_intercept_patterns": [
            "/v1/products/",
            "/reviews",
            "myntra.com/gateway/v2/product",
            "/ugc/reviews",
        ],
    },

    # ─── Ajio ────────────────────────────────────────────────────────────────
    "ajio": {
        "type": "dynamic",
        "product_name": "h1.prod-name, div[class*='prod-name']",
        "original_rating": "span.prod-rating, div[class*='prod-rating']",
        "reviews_container": "ul.prod-review-list, div[class*='review-list']",
        "review_item": "li.prod-review-item, div[class*='review-item']",
        "reviewer_name": "span.review-author",
        "review_text": "p.review-description",
        "review_rating": "span.review-rating",
        "review_date": "span.review-date",
        "verified_badge": "span.review-verified",
        "image_url": "img.review-media-thumb",
        "next_page": "button.reviewPagination-nextBtn",
        "rating_attr": None,
        "api_intercept_patterns": [
            "/api/bff/product/display",
            "/reviews",
            "ajio.com/api",
        ],
    },

    # ─── Generic fallback (httpx + BeautifulSoup heuristics) ─────────────────
    "__default__": {
        "type": "static",
        "product_name": "h1",
        "original_rating": None,
        "reviews_container": None,
        "review_item": None,
        "reviewer_name": None,
        "review_text": None,
        "review_rating": None,
        "review_date": None,
        "verified_badge": None,
        "image_url": None,
        "next_page": None,
        "rating_attr": None,
        "api_intercept_patterns": [],
    },
}

# Sites where Tier 2 (XHR intercept) is attempted alongside Tier 1
SPA_SITES = {"myntra", "ajio", "meesho", "flipkart"}


def get_selectors(url: str) -> tuple[str, dict]:
    """
    Returns (site_key, selector_dict) for the given URL.
    Falls back to '__default__' if no domain match is found.
    """
    url_lower = url.lower()
    for site_key, selectors in SELECTOR_MAP.items():
        if site_key == "__default__":
            continue
        if site_key in url_lower:
            return site_key, selectors
    return "__default__", SELECTOR_MAP["__default__"]
