"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  wallet_address?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  refreshTokens: () => Promise<boolean>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Token refresh interval (14 minutes - tokens typically expire in 15 min)
const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const isAuthenticated = !!user;

  // Get current access token
  const getAccessToken = useCallback((): string | null => {
    return localStorage.getItem("accessToken");
  }, []);

  // Refresh tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    // Prevent concurrent refresh calls
    if (isRefreshingRef.current) {
      return false;
    }

    const refreshToken = localStorage.getItem("refreshToken");
    const authMethod = localStorage.getItem("authMethod");

    // Skip refresh for cookie-based auth (handled by backend)
    if (authMethod === "cookie") {
      return true;
    }

    if (!refreshToken) {
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const tokens = data.data?.tokens || data.tokens;

      if (tokens?.accessToken && tokens?.refreshToken) {
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        return true;
      }

      throw new Error("Invalid refresh response");
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Don't clear tokens here - let checkAuth handle it
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const authMethod = localStorage.getItem("authMethod");
    const accessToken = localStorage.getItem("accessToken");

    // If no auth method set and no token, not authenticated
    if (!authMethod && !accessToken) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (authMethod === "cookie") {
        fetchOptions.credentials = "include";
      } else if (accessToken && accessToken !== "cookie-auth") {
        (fetchOptions.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      } else {
        setUser(null);
        setIsLoading(false);
        return false;
      }

      let response = await fetch(`${API_BASE_URL}/auth/me`, fetchOptions);

      // If unauthorized and using token auth, try to refresh
      if (response.status === 401 && authMethod === "token") {
        const refreshed = await refreshTokens();
        if (refreshed) {
          // Retry with new token
          const newToken = localStorage.getItem("accessToken");
          if (newToken) {
            (fetchOptions.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
            response = await fetch(`${API_BASE_URL}/auth/me`, fetchOptions);
          }
        }
      }

      if (!response.ok) {
        throw new Error("Token validation failed");
      }

      const data = await response.json();
      const userData = data.data || data.user || data;

      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        wallet_address: userData.wallet_address,
        role: userData.role,
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authMethod");
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, [refreshTokens]);

  // Login function
  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    if (tokens.accessToken && tokens.accessToken !== "" && tokens.accessToken !== "cookie-auth") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("authMethod", "token");
    }
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    // Try to revoke token on backend
    const refreshToken = localStorage.getItem("refreshToken");
    const authMethod = localStorage.getItem("authMethod");

    if (refreshToken && authMethod === "token") {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Ignore errors - we're logging out anyway
      }
    }

    // Clear interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authMethod");
    setUser(null);
    router.push("/onboarding/sign-in");
  }, [router]);

  // Setup automatic token refresh
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem("authMethod") === "token") {
      // Clear existing interval
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      // Set up periodic refresh
      refreshIntervalRef.current = setInterval(() => {
        refreshTokens();
      }, TOKEN_REFRESH_INTERVAL);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [isAuthenticated, refreshTokens]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        refreshTokens,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
