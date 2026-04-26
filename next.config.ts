import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BACKEND_URL is intentionally server-side only (not in env block)
  // It is read by src/app/api/analyze/route.ts via process.env.BACKEND_URL
  // Set it in Vercel Environment Variables dashboard (not NEXT_PUBLIC_)
};

export default nextConfig;
