import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'output: export' for Vercel deployment to support API routes
  // Only use static export for FireTV build if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
