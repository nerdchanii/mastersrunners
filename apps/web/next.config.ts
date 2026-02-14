import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@masters/types"],
  serverExternalPackages: [
    "bcryptjs",
    "@masters/database",
    "@prisma/client",
    "prisma",
    "@prisma/adapter-pg",
    "pg",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "@masters/database": "module @masters/database",
        "@prisma/adapter-pg": "module @prisma/adapter-pg",
        pg: "module pg",
      });
    }
    return config;
  },
};

export default nextConfig;
