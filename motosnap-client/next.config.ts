import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always use static export for this deployment
  output: 'export',
  basePath: '',
  assetPrefix: '',
  trailingSlash: true,  // Important for static export routing
  images: {
    unoptimized: true,  // Required for static export
  },
  // Skip type checking and linting during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle static asset paths correctly
  distDir: 'out',
};

export default nextConfig;
