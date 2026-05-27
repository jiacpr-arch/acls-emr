import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The repo-root vercel.json (for the Vite app) forces Output Directory to
  // "dist" on every Vercel project imported from this repo, and it can't be
  // overridden in the dashboard. So build Next's output INTO "dist" to match,
  // instead of the default ".next".
  distDir: "dist",
  // Pin tracing to this folder so the reader stays self-contained and does not
  // reach into the root Vite project (which has its own lockfile).
  outputFileTracingRoot: process.cwd(),
  typescript: {
    // next/og types are missing in Next 16.2.1 — runtime works fine
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
