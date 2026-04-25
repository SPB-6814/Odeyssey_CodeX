# 🛡️ ReviewGuard — Fake Review Detection System

> **Odyssey CodeX Hackathon | Problem Statement 14**

An AI-powered full-stack application that detects fake, coordinated, and manipulated product reviews using NLP, Machine Learning, and behavioral analysis.

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 · TypeScript · TailwindCSS v4 · Recharts |
| **Backend** | FastAPI (Python) · Uvicorn |
| **Scraping** | Requests · BeautifulSoup4 (+ demo fallback) |
| **ML / NLP** | TextBlob · scikit-learn (Isolation Forest, DBSCAN, TF-IDF) · NetworkX |
| **Analysis** | Behavioral heuristics · Cosine similarity · Trust scoring |

---

## 🗂️ Project Structure

```
Odeyssey_CodeX/
├── src/                        # Next.js frontend (root)
│   ├── app/
│   │   ├── page.tsx            # Landing page + news feed
│   │   ├── analysis/page.tsx   # Full 7-section dashboard
│   │   ├── globals.css         # Dark theme design system
│   │   └── layout.tsx          # App shell + sidebar
│   ├── components/ui/          # Reusable UI components
│   └── lib/
│       ├── api.ts              # Axios API client
│       └── types.ts            # TypeScript types
│
├── backend/
│   ├── api/
│   │   └── app.py              # FastAPI endpoints
│   ├── analyzer.py             # NLP + ML pipeline (10 steps)
│   ├── scraper.py              # Web scraper + mock fallback
│   ├── mock_data.py            # Realistic demo dataset
│   ├── main.py                 # Entry point
│   └── requirements.txt
│
├── next.config.ts              # API proxy to :5000
└── package.json
```

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download TextBlob corpora (first time only)
python -c "import nltk; nltk.download('punkt'); nltk.download('averaged_perceptron_tagger')"

# Start server
python main.py
# → Runs on http://localhost:5000
```

### 2. Frontend

```bash
# From project root
npm install
npm run dev
# → Runs on http://localhost:3000
```

### 3. Use It

1. Open **http://localhost:3000**
2. Type any product name (e.g. `iPhone 15`, `Sony WH-1000XM5`, `boAt Airdopes 141`) or paste a product URL
3. Click **Audit** and wait ~3–5 seconds
4. View the full analysis dashboard

---

## 🧠 AI Pipeline

| Step | Description |
|---|---|
| **1. NLP Extraction** | TextBlob sentiment, subjectivity, caps ratio, exclamation count, lexical diversity |
| **2. Similarity Detection** | TF-IDF vectorization + cosine similarity → flags near-duplicate reviews |
| **3. Behavioral Analysis** | Account age, verification status, review burst detection, helpful vote signals |
| **4. Anomaly Detection** | Isolation Forest on 11 features → unsupervised fake review detection |
| **5. Trust Scoring** | Ensemble: 30% heuristics + 35% ML anomaly + 35% behavioral |
| **6. Reviewer Clustering** | DBSCAN on reviewer features → surfaces coordinated bot networks |
| **7. Issues Extraction** | TF-IDF keyword extraction from genuine negative reviews |

---

## 📊 Dashboard Sections

1. **Product Info** — name, platform, price, data source
2. **Original Rating** — as shown on the platform
3. **Adjusted Rating** — weighted by trust scores (genuine reviews only)
4. **Genuine vs Fake Cards** — side-by-side with flag reasons & explainability
5. **Timeline Graph** — weekly review volume (total / genuine / fake)
6. **Reviewer Clusters** — DBSCAN scatter plot highlighting suspicious groups
7. **Common Issues** — TF-IDF extracted from genuine negative reviews

**Bonus:** Confidence score, explainability reasons per fake review, manipulation pattern detection (burst attacks, new-account spam, rating manipulation).

---

## 🧪 Mock Data Support

If scraping fails (e.g., anti-bot pages), the system automatically falls back to a realistic demo dataset with:
- 60–100 reviews per product
- Realistic burst patterns (fake review campaigns)
- Multiple product profiles (iPhone, Samsung, Sony, boAt, generic)

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | `{ "query": "product name or URL" }` |
| `GET` | `/api/news` | Fake review intelligence feed |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/cache/clear` | Clear analysis cache |
