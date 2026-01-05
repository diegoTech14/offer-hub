"use client";

import { useCallback, useState } from "react";

type OAuthProvider = "google" | "github";

type UseOAuthReturn = {
  isLoading: boolean;
  loadingProvider: OAuthProvider | null;
  initiateOAuth: (provider: OAuthProvider) => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useOAuth(): UseOAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const initiateOAuth = useCallback((provider: OAuthProvider) => {
    setIsLoading(true);
    setLoadingProvider(provider);

    // Redirect to the OAuth endpoint
    window.location.href = `${API_BASE_URL}/oauth/${provider}`;
  }, []);

  return {
    isLoading,
    loadingProvider,
    initiateOAuth,
  };
}
