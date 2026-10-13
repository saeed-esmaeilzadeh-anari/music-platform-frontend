import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'music-streaming-assets.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },

  // `/` has no page of its own: send every visitor straight to the sign-in screen.
  // Next's router applies this BEFORE the filesystem (pages) is consulted and before
  // anything renders, so no other content can flash on screen.
  // `permanent: false` => 307, which browsers never cache; `/` can later become a real
  // landing page without anyone being stuck on a cached redirect.
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login', // keep in sync with ROUTES.LOGIN (src/lib/constants)
        permanent: false,
      },
    ];
  },
};

export default nextConfig;