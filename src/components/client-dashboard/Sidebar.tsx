"use client";

import {
  LayoutDashboard,
  Plus,
  Search,
  FolderOpen,
  Wallet,
  MessageSquare,
  Settings,
  User,
  TrendingUp,
  History,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "@/components/dashboard/verification-badge";
import { useUserVerification } from "@/hooks/use-user-verification";
import { useAuth } from "@/providers/auth-provider";

const navigationItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/onboarding/dashboard",
    description: "Overview",
  },
  {
    title: "My Projects",
    icon: FolderOpen,
    href: "/projects/mine",
    description: "Manage work",
  },
  {
    title: "Find Talent",
    icon: Search,
    href: "/find-workers",
    description: "Hire experts",
  },
  {
    title: "Post Job",
    icon: Plus,
    href: "/projects/new",
    description: "New project",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    href: "/messages",
    description: "Chat",
    badge: "3",
  },
  {
    title: "Wallet",
    icon: Wallet,
    href: "/dashboard/wallet",
    description: "Payments",
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    href: "/onboarding/dashboard/analytics",
    description: "Insights",
  },
  {
    title: "Task History",
    icon: History,
    href: "/tasks/client",
    description: "Order & ratings",
  },
];

const accountItems = [
  {
    title: "My Profile",
    icon: User,
    href: "/dashboard/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { verificationStatus, loading: verificationLoading } =
    useUserVerification();

  const taskHistoryHref =
    user?.role?.toLowerCase() === "freelancer" ? "/tasks/freelancer" : "/tasks/client";

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {navigationItems.map((item) => {
            const href = item.title === "Task History" ? taskHistoryHref : item.href;
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-[#149A9B]/10 text-[#149A9B]"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isActive ? "text-[#149A9B]" : "text-gray-500",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-gray-500">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
                {item.badge && (
                  <span className="bg-[#149A9B] text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </p>
          <div className="space-y-1">
            {accountItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#149A9B]/10 text-[#149A9B]"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-[#149A9B]" : "text-gray-500",
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Info Footer */}
      <div className="px-3 py-4 border-t border-gray-200 bg-gray-50/50">
        <div className="space-y-3 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#149A9B] to-[#0D6B6C] flex items-center justify-center">
              <span className="text-white font-semibold text-sm">J</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Josué Araya
              </p>
              <p className="text-xs text-gray-500 truncate">Developer</p>
            </div>
          </div>

          {/* Verification Badge */}
          {!verificationLoading && verificationStatus && (
            <VerificationBadge
              level={verificationStatus.verification_level}
              size="sm"
              showLabel={true}
              verifiedAt={verificationStatus.verified_at}
            />
          )}
        </div>
      </div>
    </div>
  );
}
