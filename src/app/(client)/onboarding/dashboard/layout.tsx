"use client";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { FreelancerSidebar } from "@/components/dashboard/FreelancerSidebar";
import { useRole } from "@/lib/contexts/RoleContext";
import { ReactNode, useState, useEffect } from "react";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isFreelancer } = useRole();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="w-full border-b border-gray-200 bg-white relative z-50 shadow-sm">
        <AuthHeader onMenuClick={toggleSidebar} />
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile Sidebar Overlay */}
        {mounted && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
            onClick={toggleSidebar}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-72 bg-white z-50 animate-in slide-in-from-left duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-4 border-b border-gray-100">
                <button onClick={toggleSidebar} className="p-2 text-gray-500">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="h-[calc(100vh-70px)] overflow-y-auto">
                {isFreelancer ? <FreelancerSidebar /> : <ClientSidebar />}
              </div>
            </div>
          </div>
        )}

        <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col overflow-y-auto h-[calc(100vh-65px)] sticky top-[65px]">
          {mounted ? (
            isFreelancer ? <FreelancerSidebar /> : <ClientSidebar />
          ) : (
            <div className="flex-1 bg-white animate-pulse" />
          )}
        </aside>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
