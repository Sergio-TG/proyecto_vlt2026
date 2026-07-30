import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Hostinger suele ejecutar `npm ci --omit=dev`: no hay ESLint en node_modules,
  // y el build debe poder completarse sin instalar paquetes adicionales en runtime.
  poweredByHeader: false,
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
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dxpy1zqj6/**",
      },
    ],
  },
}

export default nextConfig
