"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  ShieldCheck, 
  BadgeCheck, 
  Sparkles, 
  Building,
  ExternalLink,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { VerificationLevel, VERIFICATION_CONFIGS } from "@/types/verification.types";
import Link from "next/link";

interface VerificationCardProps {
  level: VerificationLevel;
  verifiedAt?: string;
  walletAddress?: string;
  transactionHash?: string;
  variant?: "default" | "compact" | "detailed";
}

const iconMap = {
  "shield-off": Shield,
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
  "sparkles": Sparkles,
  "building": Building,
};

export function VerificationCard({
  level,
  verifiedAt,
  walletAddress,
  transactionHash,
  variant = "default",
}: VerificationCardProps) {
  const config = VERIFICATION_CONFIGS[level];
  const Icon = iconMap[config.icon as keyof typeof iconMap] || ShieldCheck;
  const isVerified = level > VerificationLevel.NONE;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getNextLevel = () => {
    if (level >= VerificationLevel.ENTERPRISE) return null;
    return VERIFICATION_CONFIGS[level + 1];
  };

  const nextLevel = getNextLevel();

  // Compact variant for sidebar
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <div className={`
          p-1.5 rounded-lg bg-gradient-to-br ${config.gradient}
        `}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    );
  }

  // Detailed variant for profile page
  if (variant === "detailed") {
    return (
      <Card className="border-0 shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className={`
          bg-gradient-to-br ${config.gradient} 
          px-6 py-8 text-white relative overflow-hidden
        `}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">Account Status</p>
              <h3 className="text-2xl font-bold mb-1">{config.label}</h3>
              <p className="text-white/90 text-sm">{config.description}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-4">
          {/* Verification Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Verification Level
              </span>
              <span className="font-semibold text-gray-900">
                Level {level} of 4
              </span>
            </div>

            {verifiedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Verified On
                </span>
                <span className="font-medium text-gray-900">
                  {formatDate(verifiedAt)}
                </span>
              </div>
            )}

            {walletAddress && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  Wallet
                </span>
                <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(walletAddress)}
                </code>
              </div>
            )}
          </div>

          {/* Transaction Link */}
          {transactionHash && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full border-[#149A9B] text-[#149A9B] hover:bg-[#149A9B]/10"
            >
              <Link 
                href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Stellar Explorer
              </Link>
            </Button>
          )}

          {/* Next Level Info */}
          {nextLevel && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700">
                  Next Level: {nextLevel.label}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {nextLevel.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default variant for dashboard
  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-xl
      bg-gradient-to-br ${config.gradient}
      shadow-lg hover:shadow-xl
      transition-all duration-300
      cursor-pointer
      hover:scale-105
      ${className}
    `}>
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-white">
        <p className="text-sm font-semibold">{config.label}</p>
        <p className="text-xs text-white/80">{config.description}</p>
      </div>
      {isVerified && (
        <CheckCircle className="w-5 h-5 text-white/90" />
      )}
    </div>
  );
}

