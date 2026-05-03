import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Hostinger suele ejecutar `npm ci --omit=dev`: no hay ESLint en node_modules,
  // y el build debe poder completarse sin instalar paquetes adicionales en runtime.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/vivilastermas/**",
      },
    ],
  },
}

export default nextConfig
