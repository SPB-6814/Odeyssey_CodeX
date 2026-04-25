"""
Gemini-based individual review classifier.
Sends each review to Gemini 1.5 Flash with a strict system prompt
and returns: classification ("Genuine" | "Fake"), confidence, flag_reason.
"""
import os
import json
import re
from typing import List, Tuple

import google.generativeai as genai
from dotenv import load_dotenv

from models.schemas import RawReview, GenuineReview, FakeReview

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# ─── System Prompt ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert fake review detection system. Your task is to classify product reviews as either "Genuine" or "Fake".

Classify as FAKE if you detect ANY of the following:
- Excessive superlatives or emotional language with no specifics ("AMAZING!!! BEST EVER!!!")
- Generic praise that could apply to any product (no product-specific details)
- Repetitive or template-like phrasing
- Extremely short reviews with only positive sentiment and maximum rating
- Suspicious patterns: all caps, excessive exclamation marks, vague language
- No mention of specific features, use cases, or honest trade-offs

Classify as GENUINE if the review:
- Mentions specific product features, pros AND cons
- Has a natural, conversational tone
- Includes realistic context (use case, comparison, duration of use)
- Has measured, balanced sentiment — not uniformly euphoric

Respond ONLY with a valid JSON object in this exact format:
{
  "classification": "Genuine" | "Fake",
  "confidence": <float 0.0-1.0>,
  "flag_reason": "<brief reason if Fake, empty string if Genuine>"
}"""


# ─── Classifier ──────────────────────────────────────────────────────────────

def _build_model() -> genai.GenerativeModel:
    return genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
        generation_config=genai.GenerationConfig(
            temperature=0.1,
            max_output_tokens=256,
        )
    )


def _parse_classification(response_text: str) -> Tuple[str, float, str]:
    """Safely extract fields from Gemini JSON response."""
    # Strip markdown code fences if present
    clean = re.sub(r"```(?:json)?", "", response_text).strip().rstrip("`").strip()
    try:
        data = json.loads(clean)
        classification = data.get("classification", "Genuine")
        confidence = float(data.get("confidence", 0.5))
        flag_reason = data.get("flag_reason", "")
        return classification, confidence, flag_reason
    except (json.JSONDecodeError, ValueError):
        # Fallback heuristic if JSON parse fails
        text_lower = response_text.lower()
        if "fake" in text_lower:
            return "Fake", 0.65, "Detected suspicious language patterns."
        return "Genuine", 0.70, ""


def classify_reviews(
    reviews: List[RawReview],
) -> Tuple[List[GenuineReview], List[FakeReview]]:
    """
    Classify all reviews via Gemini.
    Returns (genuine_reviews, fake_reviews).
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
    use_gemini = bool(gemini_api_key)
    gemini_budget = max(0, int(os.getenv("CLASSIFIER_GEMINI_BUDGET", "12")))
    model = _build_model() if use_gemini and gemini_budget > 0 else None

    genuine: List[GenuineReview] = []
    fake: List[FakeReview] = []

    for idx, review in enumerate(reviews):
        prompt = (
            f"Product Review to classify:\n"
            f"Rating: {review.rating}/5\n"
            f"Review Text: {review.text}\n"
            f"Date: {review.date}"
        )
        try:
            if model is not None and idx < gemini_budget:
                response = model.generate_content(prompt)
                classification, confidence, flag_reason = _parse_classification(
                    response.text
                )
            else:
                classification, confidence, flag_reason = _heuristic_classify(review)
        except Exception:
            # Network/API error: default to heuristic fallback
            classification, confidence, flag_reason = _heuristic_classify(review)

        if classification == "Fake":
            fake.append(FakeReview(
                reviewer=review.reviewer,
                rating=review.rating,
                text=review.text,
                date=review.date,
                flag_reason=flag_reason or "Suspicious review patterns detected.",
            ))
        else:
            genuine.append(GenuineReview(
                reviewer=review.reviewer,
                rating=review.rating,
                text=review.text,
                date=review.date,
            ))

    return genuine, fake


def _heuristic_classify(review: RawReview) -> Tuple[str, float, str]:
    """
    Lightweight rule-based fallback when Gemini API is unavailable.
    Checks exclamation mark density, all-caps ratio, and text length.
    """
    text = review.text
    excl_ratio = text.count("!") / max(len(text), 1)
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    word_count = len(text.split())

    score = 0.0
    reasons = []

    if excl_ratio > 0.04:
        score += 0.35
        reasons.append("Excessive exclamation marks")
    if caps_ratio > 0.20:
        score += 0.25
        reasons.append("Excessive capitalization")
    if word_count < 12:
        score += 0.20
        reasons.append("Suspiciously short review")
    if review.rating >= 4.8 and word_count < 20:
        score += 0.20
        reasons.append("Max rating with minimal text")

    if score >= 0.5:
        return "Fake", min(score + 0.2, 0.95), "; ".join(reasons)
    return "Genuine", 0.65 + (0.1 * (1 - score)), ""
