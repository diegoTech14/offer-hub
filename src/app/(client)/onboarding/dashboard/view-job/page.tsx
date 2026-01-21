"use client";

import FreelancerProfile from "@/components/client-dashboard/FreelancerProfile";

export default function ViewJobPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Job</h1>
          <p className="text-gray-600 mt-1">Review job details and freelancer profile</p>
        </div>
      </div>
      <FreelancerProfile />
    </div>
  );
}
