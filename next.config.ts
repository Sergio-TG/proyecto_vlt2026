import type { NextConfig } from "next"

const NO_STORE_HEADERS = [
  { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
  // Evita que un proxy/CDN cachee el stream RSC (text/x-component) y lo sirva
  // como documento HTML en la siguiente visita (síntoma: muro de texto $Sreact...).
  { key: "CDN-Cache-Control", value: "no-store" },
] as const

const nextConfig: NextConfig = {
  // Hostinger suele ejecutar `npm ci --omit=dev`: no hay ESLint en node_modules,
  // y el build debe poder completarse sin instalar paquetes adicionales en runtime.
  poweredByHeader: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/login",
        headers: [...NO_STORE_HEADERS],
      },
      {
        source: "/socios/portal/:path*",
        headers: [...NO_STORE_HEADERS],
      },
      {
        source: "/admin/:path*",
        headers: [...NO_STORE_HEADERS],
      },
      {
        source: "/recuperar-clave",
        headers: [...NO_STORE_HEADERS],
      },
      {
        source: "/actualizar-clave",
        headers: [...NO_STORE_HEADERS],
      },
    ]
  },
}

export default nextConfig
