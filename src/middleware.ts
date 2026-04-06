import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Reading token based on user requested key
  const token = req.cookies.get("pokharaSteel@#&!14329")?.value;

  // TOKEN EXISTS
  if (token) {
    // Prevent logged-in users from visiting home page
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Allow all admin routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
  }

  // NO TOKEN
  if (!token) {
    // Block all admin routes if not authenticated
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
