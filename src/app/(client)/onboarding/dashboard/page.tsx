/**
 * @fileoverview Modern client dashboard page
 * @author Offer Hub Team
 */

"use client";

import { DashboardEmptyState } from "@/components/client-dashboard/DashboardEmptyState.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { useState } from "react";
import { VerificationCard } from "@/components/dashboard/verification-card";
import { useUserVerification } from "@/hooks/use-user-verification";

export default function DashboardPage() {
  const [hasJobsOrContracts] = useState(false);
  const { verificationStatus, loading: verificationLoading } = useUserVerification();

  // Stats data
  const stats = [
    {
      title: "Active Projects",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Total Spent",
      value: "$0.00",
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      title: "Completed",
      value: "0",
      change: "0%",
      trend: "neutral",
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-50",
    },
    {
      title: "Pending Tasks",
      value: "0",
      change: "0",
      trend: "neutral",
      icon: Clock,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Good Morning, Josué! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back to your dashboard. Here's what's happening today.
          </p>
        </div>
        <Button 
          className="bg-[#149A9B] hover:bg-[#128889] text-white w-full sm:w-auto"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Verification Status Card */}
      {!verificationLoading && verificationStatus && (
        <VerificationCard
          level={verificationStatus.verification_level}
          verifiedAt={verificationStatus.verified_at}
          transactionHash={verificationStatus.verification_metadata?.transactionHash}
          variant="default"
        />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
                {stat.trend !== "neutral" && (
                  <span className={`
                    text-xs font-medium flex items-center gap-0.5
                    ${stat.trend === "up" ? "text-green-600" : "text-red-600"}
                  `}>
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      {hasJobsOrContracts ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Your recent projects and updates will appear here.</p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Talent
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <DashboardEmptyState />
      )}
    </div>
  );
}
