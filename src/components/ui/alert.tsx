"use client";

import React from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "success" | "error";
export type AlertSize = "sm" | "md" | "lg";

export interface AlertProps {
  variant?: AlertVariant;
  size?: AlertSize;
  title?: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Alert({
  variant = "success",
  size = "md",
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
  icon,
  children,
}: AlertProps) {
  // Variant styles
  const getVariantStyles = (variant: AlertVariant) => {
    switch (variant) {
      case "success":
        return "bg-green-50 border border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border border-red-200 text-red-800";
      default:
        return "bg-green-50 border border-green-200 text-green-800";
    }
  };

  // Size styles
  const getSizeStyles = (size: AlertSize) => {
    switch (size) {
      case "sm":
        return "p-3 text-sm";
      case "lg":
        return "p-6 text-lg";
      default:
        return "p-4 text-base";
    }
  };

  // Icon for each variant
  const getIcon = (variant: AlertVariant) => {
    if (icon) return icon;
    
    switch (variant) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg flex items-start gap-3",
        getVariantStyles(variant),
        getSizeStyles(size),
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(variant)}
      </div>
      
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">
            {title}
          </h4>
        )}
        {message && (
          <p className="text-sm">
            {message}
          </p>
        )}
        {children}
      </div>
      
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:opacity-70 transition-opacity focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Export AlertTitle and AlertDescription components for compatibility
export function AlertTitle({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <h4 className={cn("font-semibold mb-1", className)}>
      {children}
    </h4>
  );
}

export function AlertDescription({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("text-sm", className)}>
      {children}
    </div>
  );
}