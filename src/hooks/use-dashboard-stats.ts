"use client";

import { useState, useEffect, useCallback } from "react";

interface Project {
  id: string;
  title: string;
  description?: string;
  category?: string;
  budget: number;
  status: string;
  created_at: string;
}

interface DashboardStats {
  activeProjects: number;
  completedProjects: number;
  pendingProjects: number;
  totalSpent: number;
  projects: Project[];
}

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    totalSpent: 0,
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const authMethod = localStorage.getItem("authMethod");
      const accessToken = localStorage.getItem("accessToken");

      // Check if user is authenticated
      if (!authMethod && !accessToken) {
        // No auth - set empty stats and finish loading
        setStats({
          activeProjects: 0,
          completedProjects: 0,
          pendingProjects: 0,
          totalSpent: 0,
          projects: [],
        });
        setLoading(false);
        return;
      }

      // Build fetch options based on auth method
      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (authMethod === "cookie") {
        // Cookie-based auth: include cookies
        fetchOptions.credentials = "include";
      } else if (accessToken && accessToken !== "cookie-auth") {
        // Token-based auth: add Authorization header
        (fetchOptions.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/projects`, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const projects: Project[] = data.data || [];

      // Calculate statistics
      const activeProjects = projects.filter((p) => p.status === "active").length;
      const completedProjects = projects.filter((p) => p.status === "completed").length;
      const pendingProjects = projects.filter((p) => p.status === "pending").length;
      
      // Calculate total spent from completed projects
      const totalSpent = projects
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + parseFloat(p.budget.toString()), 0);

      setStats({
        activeProjects,
        completedProjects,
        pendingProjects,
        totalSpent,
        projects,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
      setError(errorMessage);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

