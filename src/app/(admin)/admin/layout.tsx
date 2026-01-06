"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import type React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute roles={["admin", "moderator"]}>
      {children}
    </ProtectedRoute>
  );
}
