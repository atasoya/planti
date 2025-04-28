import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
];

export async function middleware(request: NextRequest) {
  console.log("Middleware running");
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('planti-auth-token');
  
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

