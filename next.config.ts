import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        // Google account avatars shown in the nav when signed in.
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        // Temple hero photos. Every one is a freely-licensed file sourced from
        // Wikimedia Commons and stored as its stable upload.wikimedia.org path,
        // so this single host covers the whole set — deliberately narrow, and
        // not a general "any image host" allowance.
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
  // `pg` resolves its optional native bindings at require-time; bundling it
  // breaks that, so leave it as a plain server-side require.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
