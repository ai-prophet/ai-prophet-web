import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || "",
  },
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "api.prophetarena.co" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "*.wp.com" },
      { hostname: "s.gravatar.com" },
      { hostname: "cdn.auth0.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["recharts", "framer-motion", "date-fns"],
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
