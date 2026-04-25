import axios from 'axios';
import type { AnalysisResult, NewsItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const client = axios.create({
    baseURL: API_BASE,
    timeout: 60000,
    headers: { 'Content-Type': 'application/json' },
});

export async function analyzeProduct(query: string): Promise<AnalysisResult> {
    const res = await client.post<AnalysisResult>('/api/analyze', { query });
    return res.data;
}

export async function getNews(): Promise<NewsItem[]> {
    const res = await client.get<{ news: NewsItem[] }>('/api/news');
    return res.data.news;
}

export async function healthCheck(): Promise<{ status: string }> {
    const res = await client.get('/api/health');
    return res.data;
}
