"use client";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { FreelancerSidebar } from "@/components/dashboard/FreelancerSidebar";
import { useRole } from "@/lib/contexts/RoleContext";
import { ReactNode } from "react";

export default function FreelancerRouteLayout({ children }: { children: ReactNode }) {
    const { isFreelancer } = useRole();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <div className="w-full border-b border-gray-200 bg-white relative z-20">
                <AuthHeader />
            </div>
            <div className="flex flex-1 min-h-0">
                <aside className="w-64 border-r border-gray-200 bg-white hidden md:flex flex-col overflow-y-auto h-[calc(100vh-65px)] sticky top-[65px]">
                    {isFreelancer ? <FreelancerSidebar /> : <ClientSidebar />}
                </aside>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
