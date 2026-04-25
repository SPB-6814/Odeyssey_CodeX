'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeProduct } from '@/services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';

const LOADING_STEPS = [
    { icon: '🔍', label: 'Scraping reviews...' },
    { icon: '🧠', label: 'NLP analysis...' },
    { icon: '🤖', label: 'ML anomaly detection...' },
    { icon: '🔗', label: 'Clustering reviewers...' },
    { icon: '📊', label: 'Finalizing results...' },
];

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [query, setQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState('');
    const router = useRouter();

    // Load initial data from sessionStorage
    useEffect(() => {
        const stored = sessionStorage.getItem('analysisResult');
        const storedQuery = sessionStorage.getItem('analysisQuery');
        if (!stored) {
            router.push('/');
            return;
        }
        setData(JSON.parse(stored));
        setQuery(storedQuery || '');
        setSearchInput(storedQuery || '');
    }, [router]);

    // Cycle loading steps
    useEffect(() => {
        if (!loading) return;
        setLoadingStep(0);
        const delays = [0, 4000, 12000, 20000, 28000];
        const timers = delays.map((d, idx) => setTimeout(() => setLoadingStep(idx), d));
        return () => timers.forEach(clearTimeout);
    }, [loading]);

    // Re-analyze from dashboard search bar
    const handleReAnalyze = async (e) => {
        e.preventDefault();
        const q = searchInput.trim();
        if (!q || loading) return;

        setLoading(true);
        setError('');
        try {
            const result = await analyzeProduct(q);
            sessionStorage.setItem('analysisResult', JSON.stringify(result));
            sessionStorage.setItem('analysisQuery', q);
            setData(result);
            setQuery(q);
        } catch (err) {
            setError(
                err?.response?.data?.detail ||
                'Analysis failed. Make sure the backend is running on port 5000.'
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{
                background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '12px 16px', fontSize: '13px'
            }}>
                <p style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: 4 }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    };

    // ── Loading overlay ──────────────────────────────────────────────────────
    const LoadingOverlay = () => (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(8,8,20,0.92)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="glass-card" style={{ maxWidth: 460, width: '90%', padding: '40px 36px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                <h2 className="gradient-text" style={{ fontSize: 22, marginBottom: 8 }}>Analyzing Reviews</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                    "{searchInput}" — This may take up to 60 seconds
                </p>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    {LOADING_STEPS.map((step, idx) => (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            opacity: idx <= loadingStep ? 1 : 0.3,
                            transition: 'opacity 0.5s ease',
                        }}>
                            <span style={{ fontSize: 20 }}>{step.icon}</span>
                            <span style={{
                                fontSize: 13,
                                color: idx < loadingStep ? 'var(--success)' : idx === loadingStep ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontWeight: idx === loadingStep ? 600 : 400,
                            }}>
                                {idx < loadingStep ? '✓ ' : idx === loadingStep ? '⟳ ' : ''}{step.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                        background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
                        borderRadius: 4, transition: 'width 0.8s ease',
                    }} />
                </div>
            </div>
        </div>
    );

    // ── Initial loading (reading sessionStorage) ─────────────────────────────
    if (!data && !error) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <div className="loading-text">Loading analysis...</div>
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────────────────────
    if (error && !data) {
        return (
            <div className="dashboard">
                <div className="landing-bg" />
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                    <div className="glass-card" style={{ maxWidth: 520, width: '90%', padding: '40px 36px', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                        <h2 style={{ color: '#ff6b6b', marginBottom: 12 }}>Analysis Failed</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{error}</p>
                        <button className="search-btn" onClick={() => router.push('/')} style={{ width: 'auto', padding: '12px 28px' }}>
                            ← Back to Search
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { product, ratings, reviews, timeline, clusters, common_issues, fake_patterns } = data;
    const ratingDiff = (ratings.adjusted - ratings.original).toFixed(1);

    return (
        <div className="dashboard">
            {loading && <LoadingOverlay />}

            <div className="landing-bg" />
            <div className="container">

                {/* ── Header ─────────────────────────────────────────────── */}
                <header className="dashboard-header">
                    <a href="/" className="back-btn" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
                        ← Back
                    </a>

                    {/* Re-analyze search bar */}
                    <form onSubmit={handleReAnalyze} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 520, margin: '0 16px' }}>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Analyze another product..."
                            disabled={loading}
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.06)',
                                color: 'var(--text-primary)', fontSize: 13,
                                outline: 'none', minWidth: 0,
                            }}
                        />
                        <button
                            type="submit"
                            className="search-btn"
                            disabled={loading || !searchInput.trim()}
                            style={{ padding: '10px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
                        >
                            {loading ? <><div className="spinner" /> Analyzing...</> : '🔍 Analyze'}
                        </button>
                    </form>

                    <div className={`confidence-badge ${ratings.confidence >= 0.8 ? 'high' : 'medium'}`}>
                        🎯 {Math.round(ratings.confidence * 100)}% Confidence
                    </div>
                </header>

                {/* Query label */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div className="logo" style={{ justifyContent: 'center', marginBottom: 4 }}>
                        <div className="logo-icon">🛡️</div>
                        <span className="gradient-text">ReviewGuard</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analysis for: {query}</div>
                </div>

                {/* Error banner (when re-analyze fails but old data still shown) */}
                {error && (
                    <div style={{
                        marginBottom: 20, padding: '12px 18px',
                        background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)',
                        borderRadius: 10, color: '#ff6b6b', fontSize: 13,
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span>⚠️</span>
                        <span>{error} — Showing previous results for "{query}".</span>
                        <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: 16 }}>✕</button>
                    </div>
                )}

                {/* ── Section 1 & 2: Product Info + Ratings ─────────────── */}
                <div className="product-section animate-fade-in-up">
                    <div className="glass-card product-card">
                        <div className="product-img">📦</div>
                        <div className="product-details">
                            <h2>{product.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{product.category}</p>
                            <div className="product-meta">
                                <span>🏪 {product.platform}</span>
                                <span>💰 {product.price}</span>
                                <span>📊 {ratings.total_reviews} reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card ratings-card">
                        <div className="rating-item">
                            <div className="rating-label">Original Rating</div>
                            <div className="rating-value original">{ratings.original}</div>
                            <div className="rating-stars">{renderStars(ratings.original)}</div>
                        </div>
                        <div className="rating-divider" />
                        <div className="rating-item">
                            <div className="rating-label">Adjusted Rating</div>
                            <div className="rating-value adjusted">{ratings.adjusted}</div>
                            <div className="rating-stars">{renderStars(ratings.adjusted)}</div>
                            <div className={`rating-change ${parseFloat(ratingDiff) < 0 ? 'down' : 'up'}`}>
                                {parseFloat(ratingDiff) < 0 ? '↓' : '↑'} {Math.abs(ratingDiff)} from original
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Row ──────────────────────────────────────────── */}
                <div className="review-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="glass-card stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-number">{ratings.total_reviews}</div>
                        <div className="stat-desc">Total Reviews</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-number" style={{ color: 'var(--success)' }}>{ratings.genuine_count}</div>
                        <div className="stat-desc">Genuine</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon">🚩</div>
                        <div className="stat-number" style={{ color: 'var(--danger)' }}>{ratings.fake_count}</div>
                        <div className="stat-desc">Fake / Suspicious</div>
                    </div>
                    <div className="glass-card stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-number" style={{ color: 'var(--accent-secondary)' }}>
                            {ratings.total_reviews > 0 ? Math.round((ratings.fake_count / ratings.total_reviews) * 100) : 0}%
                        </div>
                        <div className="stat-desc">Fake Rate</div>
                    </div>
                </div>

                {/* ── Section 4: Genuine vs Fake Reviews ────────────────── */}
                <div className="reviews-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {/* Genuine Reviews */}
                    <div className="glass-card reviews-panel genuine-panel">
                        <div className="reviews-panel-header">
                            <h3>✅ Genuine Reviews</h3>
                            <span className="count">{reviews.genuine.length}</span>
                        </div>
                        <div className="reviews-list">
                            {reviews.genuine.slice(0, 20).map((review, idx) => (
                                <div key={review.id || idx} className="review-item">
                                    <div className="review-item-header">
                                        <span className="reviewer-name">
                                            {review.reviewer_name}
                                            {review.verified && <span className="verified-badge">✓ Verified</span>}
                                        </span>
                                        <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    </div>
                                    <div className="review-text">{review.text}</div>
                                    <div className="review-meta">
                                        <span>{review.date ? new Date(review.date).toLocaleDateString() : 'N/A'}</span>
                                        <span className="trust-badge high">Trust: {review.trust_score}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fake Reviews */}
                    <div className="glass-card reviews-panel fake-panel">
                        <div className="reviews-panel-header">
                            <h3>🚩 Fake / Suspicious Reviews</h3>
                            <span className="count">{reviews.fake.length}</span>
                        </div>
                        <div className="reviews-list">
                            {reviews.fake.slice(0, 20).map((review, idx) => (
                                <div key={review.id || idx} className="review-item">
                                    <div className="review-item-header">
                                        <span className="reviewer-name">
                                            {review.reviewer_name}
                                            {!review.verified && <span className="verified-badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}>✗ Unverified</span>}
                                        </span>
                                        <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    </div>
                                    <div className="review-text">{review.text}</div>
                                    <div className="review-meta">
                                        <span>{review.date ? new Date(review.date).toLocaleDateString() : 'N/A'}</span>
                                        <span className="trust-badge low">Trust: {review.trust_score}%</span>
                                    </div>
                                    {review.flag_reasons && review.flag_reasons.length > 0 && (
                                        <div className="flag-reasons">
                                            {review.flag_reasons.map((reason, i) => (
                                                <div key={i} className="flag-reason">⚠️ {reason}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Section 5 & 6: Timeline + Clusters ────────────────── */}
                <div className="charts-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="glass-card chart-card">
                        <h3>📈 Review Timeline</h3>
                        <p className="chart-desc">Review volume over time — spikes may indicate manipulation campaigns</p>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeline}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#5e5e7e"
                                        fontSize={11}
                                        tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}/${d.getMonth() + 1}`; }}
                                    />
                                    <YAxis stroke="#5e5e7e" fontSize={11} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Line type="monotone" dataKey="total" stroke="#6c5ce7" strokeWidth={2} dot={false} name="Total" />
                                    <Line type="monotone" dataKey="genuine" stroke="#00b894" strokeWidth={2} dot={false} name="Genuine" />
                                    <Line type="monotone" dataKey="fake" stroke="#ff6b6b" strokeWidth={2} dot={false} name="Fake" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-card chart-card">
                        <h3>🔗 Reviewer Clusters</h3>
                        <p className="chart-desc">DBSCAN clustering — red clusters indicate coordinated activity</p>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" dataKey="x" stroke="#5e5e7e" fontSize={11} name="Account Feature" />
                                    <YAxis type="number" dataKey="y" stroke="#5e5e7e" fontSize={11} name="Sentiment" />
                                    <ZAxis type="number" dataKey="size" range={[30, 200]} />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const d = payload[0].payload;
                                            return (
                                                <div style={{
                                                    background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px', padding: '12px 16px', fontSize: '13px'
                                                }}>
                                                    <p style={{ fontWeight: 600, color: '#f0f0f5' }}>{d.name}</p>
                                                    <p style={{ color: d.suspicious ? '#ff6b6b' : '#00b894' }}>
                                                        {d.suspicious ? '🚩 Suspicious' : '✅ Genuine'}
                                                    </p>
                                                    <p style={{ color: '#9d9db8' }}>Trust: {d.trust_score}% | Cluster: {d.cluster === -1 ? 'None' : d.cluster}</p>
                                                </div>
                                            );
                                        }}
                                    />
                                    <Scatter data={clusters} name="Reviewers">
                                        {clusters.map((entry, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={entry.suspicious ? '#ff6b6b' : '#00b894'}
                                                fillOpacity={0.7}
                                                stroke={entry.suspicious ? '#ff6b6b' : '#00b894'}
                                                strokeWidth={1}
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ── Section 7: Common Issues + Fake Patterns ──────────── */}
                <div className="bottom-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="glass-card issues-card">
                        <h3>🔍 Common Issues</h3>
                        {common_issues.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No common issues detected in genuine reviews.</p>
                        ) : (
                            common_issues.map((issue, idx) => (
                                <div key={idx} className="issue-item">
                                    <span className="issue-name">
                                        <span className={`severity-dot ${issue.severity}`} />
                                        {issue.issue}
                                    </span>
                                    <span className="issue-count">{issue.count} mentions</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="glass-card patterns-card">
                        <h3>⚠️ Detected Manipulation Patterns</h3>
                        {fake_patterns.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No manipulation patterns detected.</p>
                        ) : (
                            fake_patterns.map((pattern, idx) => (
                                <div key={idx} className={`pattern-item ${pattern.severity}`}>
                                    <div className="pattern-title">{pattern.pattern}</div>
                                    <div className="pattern-desc">{pattern.description}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
