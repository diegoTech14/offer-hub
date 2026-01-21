"use client";

import { Shield, ShieldCheck, BadgeCheck, Sparkles, Building } from "lucide-react";
import { VerificationLevel, VERIFICATION_CONFIGS } from "@/types/verification.types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  verifiedAt?: string;
  className?: string;
}

const iconMap = {
  "shield-off": Shield,
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
  "sparkles": Sparkles,
  "building": Building,
};

export function VerificationBadge({
  level,
  size = "md",
  showLabel = true,
  verifiedAt,
  className = "",
}: VerificationBadgeProps) {
  // Don't show badge for unverified users
  if (level === VerificationLevel.NONE) {
    return null;
  }

  const config = VERIFICATION_CONFIGS[level];
  const Icon = iconMap[config.icon as keyof typeof iconMap] || ShieldCheck;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "px-2 py-1",
      icon: "w-3 h-3",
      text: "text-xs",
    },
    md: {
      container: "px-3 py-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
    },
    lg: {
      container: "px-4 py-2",
      icon: "w-5 h-5",
      text: "text-base",
    },
  };

  const sizes = sizeConfig[size];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`
            inline-flex items-center gap-2 rounded-full 
            bg-gradient-to-r ${config.gradient}
            ${sizes.container}
            shadow-md hover:shadow-lg
            transition-all duration-300
            cursor-pointer
            hover:scale-105
            ${className}
          `}>
            <Icon className={`${sizes.icon} text-white animate-pulse`} />
            {showLabel && (
              <span className={`${sizes.text} font-semibold text-white`}>
                {config.label}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{config.description}</p>
            {verifiedAt && (
              <p className="text-xs text-gray-500">
                Verified: {formatDate(verifiedAt)}
              </p>
            )}
            <p className="text-xs text-gray-400">
              Registered on Stellar blockchain
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

