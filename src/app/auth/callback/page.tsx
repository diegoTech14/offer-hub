"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const isNewUser = searchParams.get("isNewUser") === "true";
        const error = searchParams.get("error");

        // Handle OAuth errors
        if (error) {
          console.error("OAuth error:", error);
          router.push(`/onboarding/sign-in?error=${error}`);
          return;
        }

        // First, try to get tokens from URL (legacy support)
        const accessTokenFromUrl = searchParams.get("accessToken");
        const refreshTokenFromUrl = searchParams.get("refreshToken");

        if (accessTokenFromUrl && refreshTokenFromUrl) {
          // Legacy flow: tokens in URL
          localStorage.setItem("accessToken", accessTokenFromUrl);
          localStorage.setItem("refreshToken", refreshTokenFromUrl);
          localStorage.setItem("authMethod", "token");

          // Get user info from backend
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessTokenFromUrl}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user info");
          }

          const data = await response.json();
          const userData = data.data || data.user || data;

          login(
            { accessToken: accessTokenFromUrl, refreshToken: refreshTokenFromUrl },
            {
              id: userData.id,
              email: userData.email,
              name: userData.name || userData.username,
              wallet_address: userData.wallet_address,
              role: userData.role,
            }
          );

          router.push(isNewUser ? "/onboarding/dashboard" : "/onboarding/dashboard");
          return;
        }

        // Cookie-based auth flow (current implementation)
        // Tokens are in HTTP-only cookies, call /auth/me with credentials
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          const userData = meData.data || meData.user || meData;

          if (userData?.id) {
            // IMPORTANT: Set authMethod FIRST, before anything else
            // This ensures all subsequent API calls use cookie-based auth
            localStorage.setItem("authMethod", "cookie");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            // Update auth context with user data (no tokens needed for cookie auth)
            login(
              { accessToken: "", refreshToken: "" },
              {
                id: userData.id,
                email: userData.email,
                name: userData.name || userData.username,
                wallet_address: userData.wallet_address,
                role: userData.role,
              }
            );

            router.push(isNewUser ? "/onboarding/dashboard" : "/onboarding/dashboard");
            return;
          }
        }

        // Authentication failed
        console.error("OAuth callback: Could not authenticate");
        router.push("/onboarding/sign-in?error=oauth_failed");
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.push("/onboarding/sign-in?error=oauth_failed");
      }
    };

    handleCallback();
  }, [searchParams, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Completing authentication...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
          </div>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
