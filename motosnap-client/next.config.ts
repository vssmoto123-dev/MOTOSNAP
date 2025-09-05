import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
