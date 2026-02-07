import type { NextConfig } from "next";
import { API_BASE } from "./src/config";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:6000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: `${API_BASE}/:path*`,
        destination: `${BACKEND_URL}${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
