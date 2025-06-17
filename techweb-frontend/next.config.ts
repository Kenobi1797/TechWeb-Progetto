import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn2.thecatapi.com",
        pathname: "/images/**",
      },
    ],
    // Consenti anche le immagini locali di leaflet
    unoptimized: true,
  },
};

export default nextConfig;
