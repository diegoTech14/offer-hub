"use client";

import React from "react";
import { AlertBannerProps } from "@/types/alert-types";
import { Alert } from "./alert";
import { cn } from "@/lib/utils";

// Componente AlertBanner para alertas fijas
export function AlertBanner({
  position = "top",
  fixed = true,
  className,
  ...alertProps
}: AlertBannerProps) {
  const positionStyles = position === "top" ? "top-0" : "bottom-0";
  const fixedStyles = fixed ? "fixed z-50 w-full" : "relative";

  return (
    <div
      className={cn(
        positionStyles,
        fixedStyles,
        "left-0 right-0",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <Alert {...alertProps} />
      </div>
    </div>
  );
}
