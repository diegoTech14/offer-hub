"use client";

import { DashboardActiveJobs } from "@/components/client-dashboard/DashboardActiveJobs";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function DashboardPage() {
  return (
    <RoleGuard allowedRole="client">
      <DashboardActiveJobs />
    </RoleGuard>
  );
}
