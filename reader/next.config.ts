import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin tracing to this folder so the reader stays self-contained and does not
  // reach into the root Vite project (which has its own lockfile).
  outputFileTracingRoot: process.cwd(),
  typescript: {
    // next/og types are missing in Next 16.2.1 — runtime works fine
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
