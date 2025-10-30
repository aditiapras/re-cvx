import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      new URL("https://scintillating-chinchilla-328.convex.cloud/**"),
      new URL("https://images.unsplash.com/**"),
    ],
  },
};

export default nextConfig;
