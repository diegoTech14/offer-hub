"use client";

import { useState, useEffect, useCallback } from "react";
import { VerificationLevel, UserVerificationStatus } from "@/types/verification.types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface UseUserVerificationReturn {
  verificationStatus: UserVerificationStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage user verification status
 * Reads from backend which caches blockchain data
 */
export function useUserVerification(): UseUserVerificationReturn {
  const [verificationStatus, setVerificationStatus] = useState<UserVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        setVerificationStatus({
          verification_level: VerificationLevel.NONE,
          verified_on_blockchain: false,
        });
        setLoading(false);
        return;
      }

      // Fetch current user data which includes verification status
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      
      // Extract verification data from user object
      const userData = data.data || data.user || data;
      
      console.log('[Verification] User data received:', {
        verification_level: userData.verification_level,
        verified_on_blockchain: userData.verified_on_blockchain,
        verified_at: userData.verified_at,
      });
      
      setVerificationStatus({
        verification_level: userData.verification_level || VerificationLevel.NONE,
        verified_on_blockchain: userData.verified_on_blockchain || false,
        verified_at: userData.verified_at,
        verification_metadata: userData.verification_metadata,
      });
    } catch (err) {
      console.error("Error fetching verification status:", err);
      setError(err instanceof Error ? err.message : "Failed to load verification status");
      
      // Set default unverified status on error
      setVerificationStatus({
        verification_level: VerificationLevel.NONE,
        verified_on_blockchain: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  return {
    verificationStatus,
    loading,
    error,
    refetch: fetchVerificationStatus,
  };
}

