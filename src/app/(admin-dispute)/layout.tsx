"use client";

import Header from "@/components/admin/layouts/Header";
import Sidebar from "@/components/admin/layouts/Sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={["admin", "moderator"]}>
      <div className="flex h-screen ">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto bg-[#F6F6F6]">
          <Header />

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
