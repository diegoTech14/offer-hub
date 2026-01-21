"use client";

import { ReactNode } from "react";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { FreelancerSidebar } from "@/components/dashboard/FreelancerSidebar";

interface DashboardLayoutProps {
    children: ReactNode;
    isFreelancer?: boolean;
}

export function DashboardLayout({ children, isFreelancer = false }: DashboardLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <div className="w-full border-b border-gray-200 bg-white relative z-20">
                <AuthHeader />
            </div>
            <div className="flex flex-1 min-h-0">
                <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col">
                    {isFreelancer ? (
                        <FreelancerSidebar />
                    ) : (
                        <ClientSidebar />
                    )}
                </aside>
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
