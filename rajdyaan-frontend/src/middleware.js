import { NextResponse } from 'next/server';

/**
 * Middleware — Yeh har request par chalta hai server level par.
 * Hum check karenge ki user ke paas 'token' cookie hai ya nahi.
 */
export function middleware(request) {
  // 1. Cookie se token nikalo
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Woh paths jo humein protect karne hain
  const protectedPaths = ['/profile', '/cart', '/wishlist', '/orders', '/checkout'];

  // 3. Check karo agar user protected path par hai aur token nahi hai
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    // Agar logged in nahi hai, toh login page par bhej do
    // 'url' property login ke baad wapas yahan aane ke liye use ho sakti hai
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 4. Agar user pehle se logged in hai aur login/register par jane ki koshish kare
  const authPaths = ['/login', '/register'];
  if (authPaths.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher: Middleware sirf in routes par chalega.
 * Static files aur images ko exclude karna zaroori hai performance ke liye.
 */
export const config = {
  matcher: [
    '/profile/:path*',
    '/cart/:path*',
    '/wishlist/:path*',
    '/orders/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ],
};
