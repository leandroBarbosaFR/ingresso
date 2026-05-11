import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permissive in dev/demo — organizers paste arbitrary cover URLs.
    // Lock this down before production by replacing the wildcard with an
    // explicit allow-list (Supabase Storage host + any approved CDNs).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
