import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "169.254.83.107",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
