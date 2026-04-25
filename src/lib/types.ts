// ─── Core Types for Fake Review Detection System ─────────────────────────────

export interface Reviewer {
    name: string;
    account_age_days: number;
    total_reviews: number;
    verified: boolean;
}

export interface Review {
    id: string;
    text: string;
    title: string;
    rating: number;
    date: string;
    reviewer_name: string;
    verified: boolean;
    helpful_votes: number;
    trust_score: number;
    fake_probability: number;
    flag_reasons: string[];
}

export interface ProductInfo {
    name: string;
    platform: string;
    category: string;
    price: string;
    image_url?: string;
    original_rating: number;
    total_ratings: number;
    source?: string;
}

export interface RatingsData {
    original: number;
    adjusted: number;
    total_reviews: number;
    genuine_count: number;
    fake_count: number;
    confidence: number;
}

export interface TimelinePoint {
    date: string;
    total: number;
    genuine: number;
    fake: number;
}

export interface ClusterPoint {
    id: number;
    name: string;
    x: number;
    y: number;
    cluster: number;
    trust_score: number;
    suspicious: boolean;
    size: number;
}

export interface CommonIssue {
    issue: string;
    count: number;
    relevance: number;
    severity: 'high' | 'medium' | 'low';
}

export interface FakePattern {
    pattern: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
    product: ProductInfo;
    ratings: RatingsData;
    reviews: {
        genuine: Review[];
        fake: Review[];
    };
    timeline: TimelinePoint[];
    clusters: ClusterPoint[];
    common_issues: CommonIssue[];
    fake_patterns: FakePattern[];
    meta?: {
        query: string;
        source: string;
        analysis_timestamp: string;
        processing_time_ms: number;
    };
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    date: string;
    category: string;
    impact: 'critical' | 'high' | 'medium' | 'low';
}
