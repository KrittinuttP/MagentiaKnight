import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const envOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : [];

function getLanOrigins() {
  try {
    return Object.values(networkInterfaces())
      .flat()
      .filter((net) => net && net.family === "IPv4" && !net.internal)
      .map((net) => net!.address);
  } catch {
    return [];
  }
}

const lanOrigins = getLanOrigins();

const nextConfig: NextConfig = {
  // Allow LAN devices to load /_next/* assets during `next dev`
  allowedDevOrigins: Array.from(
    new Set([
      "localhost",
      "localhost:3000",
      "127.0.0.1",
      "127.0.0.1:3000",
      ...lanOrigins,
      ...envOrigins,
    ])
  ),
};

export default nextConfig;
