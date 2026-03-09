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
};

export default nextConfig;
