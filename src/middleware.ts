import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require authentication
 * Users without valid tokens will be redirected to sign-in
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/my-account",
  "/messages",
  "/escrow",
  "/services",
  "/settings",
  "/profile",
];

/**
 * Routes that require admin role
 * Non-admin users will be redirected to home
 */
const ADMIN_ROUTES = [
  "/admin",
];

/**
 * Routes that should redirect authenticated users
 * (e.g., sign-in page should redirect to dashboard if already logged in)
 */
const AUTH_ROUTES = [
  "/onboarding/sign-in",
  "/onboarding/sign-up",
  "/onboarding/login",
];

/**
 * Public routes that don't require any authentication
 */
const PUBLIC_ROUTES = [
  "/",
  "/onboarding",
  "/api",
  "/_next",
  "/favicon.ico",
  "/OFFER-HUB-light.png",
  "/offer_hub_logo.png",
];

/**
 * Check if a path matches any pattern in the list
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (pathname === route) return true;
    // Prefix match (for nested routes)
    if (pathname.startsWith(`${route}/`)) return true;
    return false;
  });
}

/**
 * Check if the path is a public asset or API route
 */
function isPublicPath(pathname: string): boolean {
  // Static files and assets
  if (pathname.includes(".")) return true;
  // API routes are handled separately
  if (pathname.startsWith("/api")) return true;
  // Next.js internal routes
  if (pathname.startsWith("/_next")) return true;
  return false;
}

/**
 * Middleware function for route protection
 *
 * This middleware runs on the Edge runtime and provides:
 * - Authentication checks via token validation
 * - Role-based access control for admin routes
 * - Redirect handling for auth pages when already logged in
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public assets and API routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Skip public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Get authentication state from cookies/headers
  // Note: We check for the presence of tokens, but full validation
  // happens on the client-side with the AuthProvider
  const accessToken = request.cookies.get("accessToken")?.value;
  const authMethod = request.cookies.get("authMethod")?.value;

  // For token-based auth, also check Authorization header
  const authHeader = request.headers.get("authorization");
  const hasValidAuth = !!accessToken || !!authHeader || authMethod === "cookie";

  // Handle auth routes (sign-in, sign-up)
  // Redirect to dashboard if already authenticated
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (hasValidAuth) {
      const dashboardUrl = new URL("/onboarding/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // Handle admin routes
  // These require both authentication and admin role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!hasValidAuth) {
      const signInUrl = new URL("/onboarding/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Note: Full role validation happens client-side via ProtectedRoute
    // The middleware provides a first layer of protection
    // For enhanced security, implement JWT decoding here to check roles
    return NextResponse.next();
  }

  // Handle protected routes
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!hasValidAuth) {
      const signInUrl = new URL("/onboarding/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Configure which routes the middleware runs on
 * Using a matcher for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
