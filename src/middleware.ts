import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Si estás en modo desarrollo (tu PC), deja pasar todo
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
// 1. Si viene del subdominio temporal, ignorar el bloqueo
const host = request.headers.get('host') || '';
if (host.includes('testing.vivilastermas.com')) {
  const response = NextResponse.next()
  // Forzamos a que Google NO indexe este sitio temporal bajo ningún concepto
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}


  const { pathname } = request.nextUrl;
  const isAllowed =
    pathname === '/blog' ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/socios') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname === '/en-construccion' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico';

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/en-construccion', request.url));
  }

  return NextResponse.next();
}