/**
 * API Service — connects frontend to FastAPI backend via Next.js proxy.
 */

import axios from 'axios';

// Use the Next.js rewrite proxy (/api → localhost:5000/api) so CORS is handled
// transparently in all environments. Override with NEXT_PUBLIC_API_URL if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 120000, // 2 min — ML analysis can take 20-60 s
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Analyze a product by URL or name.
 * @param {string} query  Product name or URL
 * @param {boolean} forceRefresh  Skip cache
 */
export async function analyzeProduct(query, forceRefresh = false) {
    const response = await api.post('/api/analyze', { query, force_refresh: forceRefresh });
    return response.data;
}

/**
 * Fetch fake review news/trends.
 */
export async function getNews() {
    const response = await api.get('/api/news');
    return response.data.news;
}

/**
 * Health check.
 */
export async function healthCheck() {
    const response = await api.get('/api/health');
    return response.data;
}
