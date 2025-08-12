import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for AWS Amplify deployment with Next.js SSR support
  
  // Disable image optimization for Amplify compatibility  
  images: {
    unoptimized: true
  },
  
  // Configure for proper routing
  trailingSlash: false,
};

export default nextConfig;
