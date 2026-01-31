"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterLoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function FilterLoading({ 
  className, 
  size = "md", 
  text = "Loading filters..." 
}: FilterLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2 p-4", className)}>
      <Loader2 className={cn("animate-spin text-[#15949C]", sizeClasses[size])} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}

// Skeleton component for filter placeholders
interface FilterSkeletonProps {
  className?: string;
  count?: number;
}

export function FilterSkeleton({ className, count = 3 }: FilterSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-10 bg-gray-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
}

// Loading state for individual filter components
interface FilterItemLoadingProps {
  className?: string;
}

export function FilterItemLoading({ className }: FilterItemLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2", className)}>
      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}
