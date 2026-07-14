import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kaivu-dev-secret-change-in-production"
);

// Routes that require authentication
const protectedRoutes = ["/cart", "/orders", "/profile", "/reward", "/wallet"];

// Routes that require admin role
const adminRoutes: string[] = [];

// API routes that require admin
const adminApiRoutes = ["/api/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAdminPage = adminRoutes.some((r) => pathname.startsWith(r));
  const isAdminApi = adminApiRoutes.some((r) => pathname.startsWith(r));

  if (!isProtected && !isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = req.cookies.get("kaivu_token")?.value;

  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    // For pages, redirect to home (the auth modal can be triggered there)
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "required");
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "kaivu",
    });

    // Admin route check
    if ((isAdminPage || isAdminApi) && payload.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    // Invalid token — clear it and redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.delete("kaivu_token");
    return response;
  }
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/reward/:path*",
    "/wallet/:path*",
    "/csuite/:path*",
    "/api/admin/:path*",
  ],
};
