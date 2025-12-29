"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const isNewUser = searchParams.get("isNewUser") === "true";

        if (!accessToken || !refreshToken) {
          console.error("Missing tokens in callback");
          router.push("/onboarding/sign-in?error=missing_tokens");
          return;
        }

        // Save tokens to localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Get user info from backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user info");
        }

        const data = await response.json();
        const userData = data.data || data.user || data;

        // Update auth context
        login(
          { accessToken, refreshToken },
          {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.username,
            wallet_address: userData.wallet_address,
            role: userData.role,
          }
        );

        // Redirect based on user status
        if (isNewUser) {
          router.push("/onboarding/dashboard");
        } else {
          router.push("/onboarding/dashboard");
        }
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

