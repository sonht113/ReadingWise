import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
