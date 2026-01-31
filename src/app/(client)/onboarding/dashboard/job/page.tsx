"use client";

import JobPostingTabs from "@/components/client-dashboard/JobPostingTabs";

export default function JobPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600 mt-1">Create and publish your job posting</p>
        </div>
      </div>
      <JobPostingTabs />
    </div>
  );
}
