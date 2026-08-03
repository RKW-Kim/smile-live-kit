import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel auto-detects Next.js and handles output. No standalone needed. */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
