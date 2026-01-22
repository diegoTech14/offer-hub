"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required roles for access. If empty/undefined, any authenticated user can access */
  roles?: string[];
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom access denied component */
  accessDeniedComponent?: ReactNode;
}

/**
 * ProtectedRoute Component
 *
 * Wraps content that requires authentication and optionally specific roles.
 * Automatically redirects to sign-in if not authenticated.
 * Shows access denied if authenticated but lacks required role.
 *
 * @example
 * // Basic protection - any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Role-based protection - admin only
 * <ProtectedRoute roles={["admin"]}>
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  roles,
  loadingComponent,
  accessDeniedComponent,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to sign-in with return URL
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/onboarding/sign-in?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#149A9B] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const userRole = user?.role;
    const hasAccess = userRole && roles.includes(userRole);

    if (!hasAccess) {
      if (accessDeniedComponent) {
        return <>{accessDeniedComponent}</>;
      }
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don&apos;t have permission to access this page. Please contact
              an administrator if you believe this is an error.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2 bg-[#149A9B] text-white rounded-lg hover:bg-[#0d7a7a] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}

// Named export for backwards compatibility
export { ProtectedRoute as default };
