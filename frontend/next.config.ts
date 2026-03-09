import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "api.prophetarena.co" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "*.wp.com" },
      { hostname: "s.gravatar.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://api.prophetarena.co/api/:path*",
      },
    ];
  },
};

export default nextConfig;
