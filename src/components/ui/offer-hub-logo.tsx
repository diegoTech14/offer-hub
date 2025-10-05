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

  const iconSizeClasses = {
    sm: { o: "w-2 h-2", h: "w-2.5 h-3", text: "text-[6px]" },
    md: { o: "w-2.5 h-2.5", h: "w-3 h-4", text: "text-[7px]" },
    lg: { o: "w-3 h-3", h: "w-4 h-5", text: "text-[8px]" }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon - Black circle with white elements */}
      <div className={cn(
        "relative flex items-center justify-center rounded-full bg-black dark:bg-black",
        sizeClasses[size]
      )}>
        {/* White "o" circle - lowercase */}
        <div className={cn(
          "absolute border-2 border-white rounded-full",
          iconSizeClasses[size].o,
          "left-1 top-1/2 transform -translate-y-1/2"
        )} />
        
        {/* White "H" letter - uppercase with extended top bar */}
        <div className={cn(
          "absolute right-1 top-1/2 transform -translate-y-1/2",
          iconSizeClasses[size].h
        )}>
          {/* Left vertical bar */}
          <div className="w-0.5 h-full bg-white absolute left-0" />
          {/* Right vertical bar */}
          <div className="w-0.5 h-full bg-white absolute right-0" />
          {/* Horizontal bar */}
          <div className="w-full h-0.5 bg-white absolute top-1/2 transform -translate-y-1/2" />
          {/* Extended top bar to the right */}
          <div className="w-1 h-0.5 bg-white absolute top-1/2 transform -translate-y-1/2 right-0" />
        </div>
        
        {/* Small "OFFER HUB" text inside circle at bottom */}
        <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2">
          <span className={cn(
            "text-white font-medium leading-none tracking-tight",
            iconSizeClasses[size].text
          )}>
            OFFER HUB
          </span>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold leading-none text-black dark:text-white",
            textSizeClasses[size]
          )}>
            OFFER HUB
          </span>
        </div>
      )}
    </div>
  );
}
