"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/core/store/theme/store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove("light", "dark");
    
    // Add current theme class (default to light if undefined)
    root.classList.add(theme || "light");
  }, [theme]);

  // Set initial theme to light on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (!root.classList.contains("light") && !root.classList.contains("dark")) {
      root.classList.add("light");
    }
  }, []);

  return <>{children}</>;
}

