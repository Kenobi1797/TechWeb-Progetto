import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn2.thecatapi.com",
        pathname: "/images/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      // Aggiungi qui altri domini se necessario
    ],
    // Consenti anche le immagini locali di leaflet
    unoptimized: true,
  },
};

export default nextConfig;
