"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface AuthHeaderProps {
  onMenuClick?: () => void;
}

export function AuthHeader({ onMenuClick }: AuthHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2 text-gray-600"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center">
            <Image
              src="/dark_logo.svg"
              alt="Offer Hub"
              width={30}
              height={30}
              className="text-white"
            />
          </div>
          <span className="text-lg md:text-xl font-semibold text-gray-900">Offer Hub</span>
        </div>

        <Button
          asChild
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium"
        >
          <Link href="/onboarding/sign-up">Sign up</Link>
        </Button>
      </div>
    </header>
  );
}
