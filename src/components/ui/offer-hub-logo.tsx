"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface OfferHubLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function OfferHubLogo({ 
  className = "", 
  size = "md",
  showText = true 
}: OfferHubLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "relative flex items-center justify-center rounded-full bg-gray-700 dark:bg-gray-600",
        sizeClasses[size]
      )}>
        {/* White "o" circle */}
        <div className="absolute w-3 h-3 border-2 border-white rounded-full left-1 top-1/2 transform -translate-y-1/2" />
        
        {/* White "H" letter */}
        <div className="absolute right-1 top-0 bottom-0 w-3">
          <div className="w-0.5 h-full bg-white absolute left-0" />
          <div className="w-0.5 h-full bg-white absolute right-0" />
          <div className="w-full h-0.5 bg-white absolute top-1/2 transform -translate-y-1/2" />
        </div>
        
        {/* Small text inside circle */}
        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
          <span className="text-[8px] text-white font-medium leading-none">OFFER HUB</span>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold leading-none text-[#1e3a8a] dark:text-blue-400",
            textSizeClasses[size]
          )}>
            OFFER HUB
          </span>
        </div>
      )}
    </div>
  );
}
