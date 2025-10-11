"use client";

import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#149A9B] to-[#0D7475] shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 mt-1">Track your project performance and earnings</p>
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <AnalyticsDashboard />
    </div>
  );
}


