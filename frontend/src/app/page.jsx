'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeProduct, getNews } from '@/services/api';

const LOADING_STEPS = [
    { icon: '🔍', label: 'Scraping product reviews...' },
    { icon: '🧠', label: 'Running NLP & sentiment analysis...' },
    { icon: '🤖', label: 'ML anomaly detection (Isolation Forest)...' },
    { icon: '🔗', label: 'Clustering reviewers (DBSCAN)...' },
    { icon: '📊', label: 'Building your dashboard...' },
];

export default function LandingPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState('');
    const [news, setNews] = useState([]);
    const router = useRouter();

    useEffect(() => {
        getNews()
            .then(setNews)
            .catch(() => setNews([]));
    }, []);

    // Cycle through loading steps with realistic timing
    useEffect(() => {
        if (!loading) return;
        setLoadingStep(0);
        const intervals = [0, 4000, 12000, 20000, 28000];
        const timers = intervals.map((delay, idx) =>
            setTimeout(() => setLoadingStep(idx), delay)
        );
        return () => timers.forEach(clearTimeout);
    }, [loading]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        try {
            const data = await analyzeProduct(query.trim());
            sessionStorage.setItem('analysisResult', JSON.stringify(data));
            sessionStorage.setItem('analysisQuery', query.trim());
            router.push('/dashboard');
        } catch (err) {
            console.error('Analysis failed:', err);
            setError(
                err?.response?.data?.detail ||
                'Analysis failed. Make sure the backend server is running on port 5000.'
            );
            setLoading(false);
        }
    };

    return (
        <div className="landing">
            <div className="landing-bg" />

            {/* Full-screen loading overlay */}
            {loading && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(8,8,20,0.92)', backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div className="glass-card" style={{ maxWidth: 480, width: '90%', padding: '40px 36px', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                        <h2 className="gradient-text" style={{ fontSize: 22, marginBottom: 8 }}>Analyzing Reviews</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
                            "{query}" — This may take up to 60 seconds
                        </p>

                        {/* Steps */}
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

                        {/* Progress bar */}
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%`,
                                background: 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
                                borderRadius: 4,
                                transition: 'width 0.8s ease',
                            }} />
                        </div>
                    </div>
                </div>
            )}

            <div className="container">
                {/* Navigation */}
                <nav className="landing-nav">
                    <div className="logo">
                        <div className="logo-icon">🛡️</div>
                        <span className="gradient-text">ReviewGuard</span>
                    </div>
                    <div className="nav-badge">Odyssey CodeX</div>
                </nav>

                {/* Hero Section */}
                <section className="hero">
                    <div className="hero-badge">
                        🔬 AI-Powered Review Analysis Engine
                    </div>

                    <h1>
                        Detect <span className="gradient-text">Fake Reviews</span><br />
                        Before You Buy
                    </h1>

                    <p>
                        Our NLP &amp; Machine Learning engine analyzes product reviews in real-time,
                        identifying manipulated, fake, and coordinated review campaigns to help
                        you make informed purchasing decisions.
                    </p>

                    {/* Search Bar */}
                    <form className="search-container" onSubmit={handleAnalyze}>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Paste product URL or enter product name (e.g., iPhone 15, Samsung Galaxy S24)..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
                                {loading ? (
                                    <>
                                        <div className="spinner" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>🔍 Analyze Product</>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Error message */}
                    {error && (
                        <div style={{
                            marginTop: 16, padding: '14px 20px',
                            background: 'rgba(255,107,107,0.1)',
                            border: '1px solid rgba(255,107,107,0.3)',
                            borderRadius: 10, color: '#ff6b6b',
                            fontSize: 13, textAlign: 'left',
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="stats-row">
                        <div className="stat-item">
                            <div className="stat-value gradient-text">25M+</div>
                            <div className="stat-label">Reviews Analyzed</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value gradient-text">94%</div>
                            <div className="stat-label">Detection Accuracy</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value gradient-text">500K+</div>
                            <div className="stat-label">Products Scanned</div>
                        </div>
                    </div>
                </section>

                {/* News Section */}
                <section className="news-section">
                    <div className="section-header">
                        <h2>
                            🔥 Latest <span className="gradient-text-warm">Fake Review</span> News
                        </h2>
                        <p>Stay informed about the latest trends in review manipulation across the internet</p>
                    </div>

                    <div className="news-grid">
                        {news.map((item, idx) => (
                            <article
                                key={item.id || idx}
                                className="glass-card news-card"
                                style={{ animationDelay: `${idx * 0.1}s`, animation: 'fadeInUp 0.6s ease-out forwards', opacity: 0 }}
                            >
                                <div className="news-card-header">
                                    <span className={`news-category ${item.impact}`}>{item.category}</span>
                                    <span className="news-date">{item.date}</span>
                                </div>
                                <h3>{item.title}</h3>
                                <p>{item.summary}</p>
                                <div className="news-source">
                                    📰 {item.source}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
