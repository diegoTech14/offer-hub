"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderNavigationProps {
  title?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  showDarkModeToggle?: boolean;
  className?: string;
}

export default function HeaderNavigation({
  title = "Offer Hub",
  showBackButton = true,
  backButtonText = "← Back to Home",
  onBackClick,
  showDarkModeToggle = true,
  className = "",
}: HeaderNavigationProps) {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push("/");
    }
  };

  return (
    <header className={`bg-gray-900 dark:bg-gray-900 border-b border-gray-800 dark:border-gray-700 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo/Title - Clickable */}
        <button
          onClick={handleLogoClick}
          className="text-2xl font-bold text-teal-400 hover:text-teal-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 rounded px-2 py-1"
        >
          {title}
        </button>

        {/* Right side buttons */}
        <div className="flex items-center gap-3">
          {/* Back to Home Button */}
          {showBackButton && (
            <Button
              onClick={handleBackClick}
              variant="outline"
              className="flex items-center gap-2 bg-gray-800 dark:bg-gray-800 border-gray-700 dark:border-gray-600 text-blue-400 dark:text-blue-400 hover:bg-gray-700 dark:hover:bg-gray-700 hover:text-blue-300 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              {backButtonText}
            </Button>
          )}

          {/* Dark Mode Toggle */}
          {showDarkModeToggle && (
            <ThemeToggle />
          )}
        </div>
      </div>
    </header>
  );
}
