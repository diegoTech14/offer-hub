"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReactNode, useState } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Navbar - Same as other pages */}
      <Navbar showAuth={true} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, toggle with navbar button */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-40 
          w-64 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          mt-0 md:mt-0
        `}>
          <ClientSidebar />
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
