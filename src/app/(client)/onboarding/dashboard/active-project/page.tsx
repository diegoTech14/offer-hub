"use client";

import { ActiveProjectManagement } from "@/components/client-dashboard/ActiveProjectManagement";

export default function ActiveProjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Project</h1>
          <p className="text-gray-600 mt-1">Manage your active project details</p>
        </div>
      </div>
      <ActiveProjectManagement />
    </div>
  );
}
