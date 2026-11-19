// ---------------------------------------------------------------------------
// Zino One — Route Protection Middleware (§6.2)
// Protects /admin/* and /account/* by checking for the session cookie.
// API routes do NOT rely on middleware; they verify the DB session directly.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    Boolean(req.cookies.get("__Secure-authjs.session-token")?.value) ||
    Boolean(req.cookies.get("authjs.session-token")?.value);

  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
