import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Mengizinkan akses HMR dari IP lokal LAN */
  allowedDevOrigins: ["192.168.1.9", "localhost:3000"],

  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;