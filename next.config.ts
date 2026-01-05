import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  serverExternalPackages: ["zod"],
  experimental: {
    turbopackScopeHoisting: false,
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
