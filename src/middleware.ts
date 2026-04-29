import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Si estás en modo desarrollo (tu PC), deja pasar todo
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isAllowed = 
    pathname.startsWith('/socios') || 
    pathname.startsWith('/admin') || 
    pathname === '/en-construccion' ||
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico';

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/en-construccion', request.url));
  }

  return NextResponse.next();
}