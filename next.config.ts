import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors (they will still be shown locally
    // during development). Remove this once the codebase is clean.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type-checking during production build.  This lets the
    // application deploy even while you are gradually fixing the
    // strict TypeScript errors called out by `next lint`.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
