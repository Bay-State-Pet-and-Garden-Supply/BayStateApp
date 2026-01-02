import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["zod"],
  experimental: {
    turbopackScopeHoisting: false,
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
