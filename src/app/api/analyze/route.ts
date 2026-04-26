import { NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";

function getBackendCandidates(): string[] {
  // Collect all env-provided URLs (server-side only, never exposed to browser)
  const fromEnv = [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    ...(process.env.BACKEND_FALLBACK_URLS || "").split(","),
  ]
    .map((v) => (v || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (fromEnv.length === 0) {
    if (IS_PROD) {
      console.error(
        "[API Proxy] BACKEND_URL is not set. Set it in Vercel Environment Variables."
      );
    }
    // In development, fall back to local FastAPI server
    return ["http://127.0.0.1:8000", "http://localhost:8000"];
  }

  // In production, NEVER append localhost — it will always fail on Vercel
  const localhostFallbacks = IS_PROD
    ? []
    : ["http://127.0.0.1:8000", "http://localhost:8000"];

  return [...new Set([...fromEnv, ...localhostFallbacks])];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json({ detail: "URL cannot be empty." }, { status: 400 });
    }

    const backendCandidates = getBackendCandidates();
    const errors: string[] = [];

    for (const baseUrl of backendCandidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 240_000);

        const upstream = await fetch(`${baseUrl}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const text = await upstream.text();
        const contentType = upstream.headers.get("content-type") || "application/json";

        return new Response(text, {
          status: upstream.status,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "no-store",
          },
        });
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Unknown fetch error";
        errors.push(`${baseUrl} -> ${detail}`);
      }
    }

    return NextResponse.json(
      {
        detail:
          "Backend connection failed: fetch failed. Please ensure FastAPI is running and BACKEND_URL is correct.",
        tried: backendCandidates,
        errors,
      },
      { status: 502 }
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected proxy failure";
    return NextResponse.json(
      { detail: `Backend connection failed: ${detail}` },
      { status: 502 }
    );
  }
}
