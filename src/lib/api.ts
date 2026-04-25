/**
 * API client for the Fake Review Detector backend.
 * Exports `analyzeProduct(url)` which POSTs to the FastAPI backend
 * and returns a strongly-typed AnalysisResult.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

// ─── Types matching backend schemas.py ──────────────────────────────────────

export interface ProductDetails {
    name: string;
    original_rating: number;
    adjusted_rating: number;
    category?: string;
    total_reviews: number;
}

export interface GenuineReview {
    reviewer: string;
    rating: number;
    text: string;
    date: string;
}

export interface FakeReview {
    reviewer: string;
    rating: number;
    text: string;
    date: string;
    flag_reason: string;
}

export interface ReviewsBreakdown {
    genuine_reviews: GenuineReview[];
    fake_reviews: FakeReview[];
}

export interface TimelineDataPoint {
    date: string;          // e.g. "Jan 2024"
    review_count: number;
    avg_rating: number;
    sentiment: "positive" | "negative" | "neutral";
}

export interface ReviewerClusterPoint {
    cluster_id: number;
    cluster_name: string;
    percentage: number;
    color: string;
    reviewer_name: string;
    trust_score: number;
    x_coordinate: number;
    y_coordinate: number;
}

export interface CommonIssue {
    issue: string;
    count: number;
    severity: "high" | "medium" | "low";
}

export interface AnalysisResult {
    product_details: ProductDetails;
    reviews_breakdown: ReviewsBreakdown;
    timeline_graph_data: TimelineDataPoint[];
    reviewer_cluster_data: ReviewerClusterPoint[];
    common_issues: CommonIssue[];
}

// ─── API call ────────────────────────────────────────────────────────────────

export async function analyzeProduct(url: string): Promise<AnalysisResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 240_000);

    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(error.detail || `Request failed with status ${response.status}`);
        }

        return response.json() as Promise<AnalysisResult>;
    } catch (err) {
        if (err instanceof Error) {
            if (err.name === "AbortError") {
                throw new Error("Analysis timed out while scraping the product page. Please try again.");
            }
            if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
                throw new Error("Could not reach the analysis service. Ensure backend is running and try again.");
            }
            throw err;
        }
        throw new Error("Failed to connect to the analysis backend.");
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Chart.js data transformers ──────────────────────────────────────────────

/** Converts timeline_graph_data → Chart.js Line chart data object */
export function toTimelineChartData(data: TimelineDataPoint[]) {
    return {
        labels: data.map((d) => d.date),
        datasets: [
            {
                label: "Avg Rating",
                data: data.map((d) => d.avg_rating),
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.15)",
                tension: 0.3,
                pointBackgroundColor: data.map((d) =>
                    d.sentiment === "positive" ? "#10b981" : "#ef4444"
                ),
                pointRadius: 5,
            },
        ],
    };
}

/** Converts reviewer_cluster_data → Chart.js Bar chart data (cluster % breakdown) */
export function toClusterBarChartData(data: ReviewerClusterPoint[]) {
    // Aggregate unique cluster names & percentages
    const seen = new Map<string, { pct: number; color: string }>();
    for (const point of data) {
        if (!seen.has(point.cluster_name)) {
            seen.set(point.cluster_name, { pct: point.percentage, color: point.color });
        }
    }
    const entries = Array.from(seen.entries());
    return {
        labels: entries.map(([name]) => name),
        datasets: [
            {
                label: "Percentage",
                data: entries.map(([, v]) => v.pct),
                backgroundColor: entries.map(([, v]) => v.color),
                borderColor: entries.map(([, v]) => v.color),
                borderWidth: 1,
            },
        ],
    };
}
