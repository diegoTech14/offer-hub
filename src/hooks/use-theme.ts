"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const THEME_KEY = "offer-hub-theme";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      const initialTheme = savedTheme || systemTheme;
      setTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
    } catch (error) {
      // Fallback to light theme if storage access fails
      console.warn("Failed to access localStorage or matchMedia:", error);
    }
  }, []);

  // Update theme
  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const setLightTheme = () => applyTheme("light");
  const setDarkTheme = () => applyTheme("dark");
  const toggleTheme = () => applyTheme(theme === "light" ? "dark" : "light");

  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    mounted,
  };
}
