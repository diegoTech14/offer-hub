"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  RegisterWithEmailPayload,
  RegisterWithWalletPayload,
  RegisterResponse,
  LoginWithEmailPayload,
  LoginResponse,
} from "@/types/auth-register.types";
import { parseAuthError, AuthErrorDetails } from "@/utils/auth-error-handler";

type UseRegisterReturn = {
  isLoading: boolean;
  error: string | null;
  errorDetails: AuthErrorDetails | null;
  registerWithEmail: (payload: RegisterWithEmailPayload) => Promise<boolean>;
  registerWithWallet: (payload: RegisterWithWalletPayload) => Promise<boolean>;
  loginWithEmail: (payload: LoginWithEmailPayload) => Promise<boolean>;
  clearError: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useRegister(): UseRegisterReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<AuthErrorDetails | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const clearError = useCallback(() => {
    setError(null);
    setErrorDetails(null);
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
      setErrorDetails(null);

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
          const errorInfo = parseAuthError(response, data, "Registration failed. Please try again.");
          setError(errorInfo.message);
          setErrorDetails(errorInfo);
          return false;
        }

        // Save tokens and update auth context
        if (data.data?.tokens && data.data?.user) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
          login(data.data.tokens, {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            wallet_address: data.data.user.wallet_address,
          });
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const errorInfo = parseAuthError(null, null, "Unable to connect. Please check your internet connection and try again.");
        setError(errorInfo.message);
        setErrorDetails(errorInfo);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, login]
  );

  const registerWithWallet = useCallback(
    async (payload: RegisterWithWalletPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setErrorDetails(null);

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
          const errorInfo = parseAuthError(response, data, "Registration failed. Please try again.");
          setError(errorInfo.message);
          setErrorDetails(errorInfo);
          return false;
        }

        // Save tokens and update auth context
        if (data.data?.tokens && data.data?.user) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
          login(data.data.tokens, {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            wallet_address: data.data.user.wallet_address,
          });
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const errorInfo = parseAuthError(null, null, "Unable to connect. Please check your internet connection and try again.");
        setError(errorInfo.message);
        setErrorDetails(errorInfo);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, login]
  );

  const loginWithEmail = useCallback(
    async (payload: LoginWithEmailPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setErrorDetails(null);

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
          const errorInfo = parseAuthError(response, data, "Login failed. Please check your credentials and try again.");
          setError(errorInfo.message);
          setErrorDetails(errorInfo);
          return false;
        }

        // Save tokens and update auth context
        if (data.data?.tokens && data.data?.user) {
          saveTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
          login(data.data.tokens, {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.name,
            wallet_address: data.data.user.wallet_address,
          });
        }

        // Redirect to dashboard
        router.push("/onboarding/dashboard");

        return true;
      } catch (err) {
        const errorInfo = parseAuthError(null, null, "Unable to connect. Please check your internet connection and try again.");
        setError(errorInfo.message);
        setErrorDetails(errorInfo);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router, login]
  );

  return {
    isLoading,
    error,
    errorDetails,
    registerWithEmail,
    registerWithWallet,
    loginWithEmail,
    clearError,
  };
}

