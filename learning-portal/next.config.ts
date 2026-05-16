import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint is handled via CLI in Next.js 16
};

export default nextConfig;
