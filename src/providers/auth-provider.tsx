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
    const accessToken = localStorage.getItem("accessToken");
    
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      // Verify token with backend
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

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
      setUser(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Login function
  const login = useCallback((tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    setUser(userData);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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

