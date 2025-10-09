import type { NextConfig } from "next";

const nextConfig: NextConfig = {
images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '**',  // Allows any path under this hostname
      },
    {
        protocol: 'https',
        hostname: 'e-commercejouets-production.up.railway.app',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
