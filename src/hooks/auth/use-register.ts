"use client";

import { useCallback, useState } from "react";
import {
  RegisterWithEmailPayload,
  RegisterWithWalletPayload,
  RegisterResponse,
  LoginWithEmailPayload,
  LoginResponse,
} from "@/types/auth-register.types";
import { useRouter } from "next/navigation";

type UseRegisterReturn = {
  isLoading: boolean;
  error: string | null;
  registerWithEmail: (payload: RegisterWithEmailPayload) => Promise<boolean>;
  registerWithWallet: (payload: RegisterWithWalletPayload) => Promise<boolean>;
  loginWithEmail: (payload: LoginWithEmailPayload) => Promise<boolean>;
  clearError: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const saveTokens = (accessToken: string, refreshToken: string) => {
    // Store tokens in localStorage
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const registerWithEmail = useCallback(
    async (payload: RegisterWithEmailPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register-with-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data: RegisterResponse = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: null as any,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: "unknown",
          },
        }));

        if (!response.ok || !data.success) {
          const message = data?.message || `Registration failed: ${response.status}`;
          setError(message);
          return false;
        }

        // Save tokens
        if (data.data?.tokens) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const registerWithWallet = useCallback(
    async (payload: RegisterWithWalletPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register-with-wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data: RegisterResponse = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: null as any,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: "unknown",
          },
        }));

        if (!response.ok || !data.success) {
          const message = data?.message || `Registration failed: ${response.status}`;
          setError(message);
          return false;
        }

        // Save tokens
        if (data.data?.tokens) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const loginWithEmail = useCallback(
    async (payload: LoginWithEmailPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data: LoginResponse = await response.json().catch(() => ({
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`,
          data: null as any,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: "unknown",
          },
        }));

        if (!response.ok || !data.success) {
          const message = data?.message || `Login failed: ${response.status}`;
          setError(message);
          return false;
        }

        // Save tokens
        if (data.data?.tokens) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  return {
    isLoading,
    error,
    registerWithEmail,
    registerWithWallet,
    loginWithEmail,
    clearError,
  };
}

