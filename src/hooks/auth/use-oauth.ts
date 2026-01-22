"use client";

import { useState, useCallback } from "react";

export type OAuthProvider = "google" | "github";

interface UseOAuthReturn {
  initiateOAuth: (provider: OAuthProvider) => void;
  isLoading: boolean;
  loadingProvider: OAuthProvider | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useOAuth(): UseOAuthReturn {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const initiateOAuth = useCallback((provider: OAuthProvider) => {
    setLoadingProvider(provider);
    // Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE_URL}/oauth/${provider}`;
  }, []);

  return {
    initiateOAuth,
    isLoading: loadingProvider !== null,
    loadingProvider,
  };
}
