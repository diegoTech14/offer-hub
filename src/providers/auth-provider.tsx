"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      // For cookie-based auth, use credentials: include (no Authorization header)
      // For token-based auth, send Authorization header
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (authMethod === "cookie") {
        // Cookie-based auth: include cookies, no Authorization header
        fetchOptions.credentials = "include";
      } else if (accessToken && accessToken !== "cookie-auth") {
        // Token-based auth: send Authorization header
        (fetchOptions.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      } else {
        // No valid auth method
        setUser(null);
        setIsLoading(false);
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, fetchOptions);

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
  }, []);

  // Login function
  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    // Only store tokens if they are real tokens (not empty or placeholder)
    if (tokens.accessToken && tokens.accessToken !== "" && tokens.accessToken !== "cookie-auth") {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("authMethod", "token");
    }
    // For cookie-based auth, authMethod is set before calling login
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authMethod");
    setUser(null);
    router.push("/onboarding/sign-in");
  }, [router]);

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

