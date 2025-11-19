import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple JWT payload decoder (without verification for middleware)
function decodeJWTPayload(token: string) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = Buffer.from(base64Payload, "base64").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

// Define protected routes
const protectedRoutes = ["/admin", "/wallet", "/my-tickets"];
const adminOnlyRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Debug logging
  console.log("Middleware - pathname:", pathname);
  console.log("Middleware - token exists:", !!token);

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = adminOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  console.log("Middleware - isProtectedRoute:", isProtectedRoute);
  console.log("Middleware - isAdminRoute:", isAdminRoute);

  // If accessing a protected route without token, redirect to home
  if (isProtectedRoute && !token) {
    console.log("Middleware - Redirecting: no token for protected route");
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // For admin routes, verify user role
  if (isAdminRoute && token) {
    const payload = decodeJWTPayload(token);
    console.log("Middleware - JWT payload:", payload);

    if (!payload) {
      console.log("Middleware - Redirecting: invalid JWT payload");
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // If role is in payload, check it directly
    if (payload.role !== "admin") {
      console.log(
        "Middleware - Redirecting: user role is not admin, role is:",
        payload.role
      );
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    console.log("Middleware - Admin access granted");
  }

  console.log("Middleware - Allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
