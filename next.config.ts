import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server build for the production Docker image.
  output: "standalone",
  images: {
    // Rich-text content can embed images from arbitrary hosts.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
