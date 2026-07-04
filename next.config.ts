import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "music-streaming-assets.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // Proxy API calls in dev via rewrites to avoid CORS
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/proxy/:path*",
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          },
        ]
      : [];
  },
};

export default nextConfig;
