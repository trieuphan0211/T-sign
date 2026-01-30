import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://100.115.112.37:8080/api/v1/:path*",
      },
    ];
  },
  output: "standalone",
};

export default nextConfig;
