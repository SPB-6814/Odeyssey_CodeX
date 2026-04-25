import './globals.css';

export const metadata = {
    title: 'ReviewGuard — Fake Review Detection System',
    description: 'AI-powered fake review detection and product analysis platform. Identify genuine vs fake reviews using NLP and Machine Learning.',
    keywords: 'fake review detection, review analysis, NLP, machine learning, product reviews',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
