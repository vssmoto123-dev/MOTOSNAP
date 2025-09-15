import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export for development to allow dynamic routes
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  basePath: '',
  assetPrefix: '',
  trailingSlash: process.env.NODE_ENV === 'production',  // Only for static export
  images: {
    unoptimized: process.env.NODE_ENV === 'production',  // Only required for static export
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
