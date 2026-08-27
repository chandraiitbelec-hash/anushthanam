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
    ],
  },
  // `pg` resolves its optional native bindings at require-time; bundling it
  // breaks that, so leave it as a plain server-side require.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
