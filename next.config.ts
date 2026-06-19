import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Room/media photos are arbitrary user-supplied URLs (any host), so we
    // skip the optimizer rather than enumerate remote hosts. next/image still
    // gives us lazy loading, layout-stable sizing, and async decoding.
    unoptimized: true,
  },
};

export default nextConfig;
