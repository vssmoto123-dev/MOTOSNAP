import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server-side rendering for dynamic content
  output: undefined,
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,  // Not needed for SSR
  images: {
    unoptimized: true,  // Keep for now, can be optimized later
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
