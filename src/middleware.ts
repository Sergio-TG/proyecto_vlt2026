import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""

  // === TEMPORAL: BORRAR PARA PRODUCCIÓN (Acceso para el Propietario ) ===
  // Permite navegar el sitio completo en testing.vivilastermas.com sin redirigir a /en-construccion.
  if (host.includes("testing.vivilastermas.com")) {
    const response = NextResponse.next()
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
    return response
  }
  // =====================================================================

  // Modo desarrollo local: sin bloqueo de mantenimiento
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  const isAllowed =
    pathname === "/blog" ||
    pathname.startsWith("/blog/") ||
    pathname.startsWith("/socios") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/en-construccion" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/en-construccion", request.url))
  }

  return NextResponse.next()
}
