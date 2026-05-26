import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("auth_token")?.value;
  const role = req.cookies.get("user_role")?.value;

  // 1. If user is NOT logged in
  if (!token) {
    const isProtectedPath = pathname.startsWith("/admin") || pathname.startsWith("/pos") || pathname.startsWith("/user");
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. If user IS logged in
  if (token) {
    // 2.1. ROLE: ADMIN (Strict isolation to /admin)
    if (role === "ADMIN") {
      const allowed = pathname.startsWith("/admin");
      if (!allowed || pathname === "/login") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // 2.2. ROLE: POS (Strict isolation to /pos)
    if (role === "POS") {
      const allowed = pathname.startsWith("/pos");
      if (!allowed || pathname === "/login") {
        return NextResponse.redirect(new URL("/pos", req.url));
      }
    }

    // 2.3. ROLE: USER (Customers - allowed / and /user)
    if (role === "USER" || !role) { // Assume USER if role missing but token exists
      const restricted = pathname.startsWith("/admin") || pathname.startsWith("/pos");
      if (restricted || pathname === "/login") {
        return NextResponse.redirect(new URL("/user/profile", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/pos/:path*", "/user/:path*"],
};
