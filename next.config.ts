import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server build for the production Docker image.
  output: "standalone",
  images: {
    // Rich-text content can embed images from arbitrary hosts.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // The avatar uploader posts a downscaled image as a data: URI through a
    // server action; the default 1mb limit is tight for that plus the rest
    // of the settings form.
    serverActions: { bodySizeLimit: "3mb" },
    // All public/admin pages are `force-dynamic` and mutated via server
    // actions + revalidatePath. Without this, the client-side router cache
    // can still serve an already-prefetched (stale) copy of a route — e.g.
    // the "Posts" nav link — for up to 30s after an admin change, which
    // reads as "my save didn't work" even though the database and a fresh
    // reload are correct.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
