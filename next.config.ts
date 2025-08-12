import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for AWS Amplify deployment
  
  // Disable image optimization for Amplify compatibility  
  images: {
    unoptimized: true
  },
  
  // Configure for proper routing
  trailingSlash: false,
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
