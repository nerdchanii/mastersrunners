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
    "@prisma/adapter-libsql",
    "@libsql/client",
    "libsql",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "@masters/database": "module @masters/database",
        "@prisma/adapter-libsql": "module @prisma/adapter-libsql",
        "@libsql/client": "module @libsql/client",
        libsql: "module libsql",
      });
    }
    return config;
  },
};

export default nextConfig;
