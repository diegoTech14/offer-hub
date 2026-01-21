"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { FreelancerSidebar } from "@/components/dashboard/FreelancerSidebar";
import { useRole } from "@/lib/contexts/RoleContext";
import { ReactNode, useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isFreelancer } = useRole();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Main Navbar */}
        <Navbar showAuth={true} />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Dynamically choose based on role */}
          <aside className={`
            fixed md:static inset-y-0 left-0 z-40 
            w-64 transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            bg-white border-r border-gray-200 overflow-y-auto
          `}>
            {mounted ? (
              isFreelancer ? <FreelancerSidebar /> : <ClientSidebar />
            ) : (
              <div className="flex-1 bg-white animate-pulse" />
            )}
          </aside>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
