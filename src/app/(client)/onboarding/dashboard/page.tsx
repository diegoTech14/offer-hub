"use client";

import { useState, useEffect } from "react";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";
import { FreelancerDashboard } from "@/components/dashboard/FreelancerDashboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const [isFreelancer, setIsFreelancer] = useState(false);

  // Sync with localStorage so the Layout can also see it
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    setIsFreelancer(savedRole === "freelancer");
  }, []);

  const handleToggle = (checked: boolean) => {
    setIsFreelancer(checked);
    localStorage.setItem("userRole", checked ? "freelancer" : "client");
    // Reload to let the Layout update its sidebar
    window.location.reload();
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Role Switcher for Development Preview */}
      <div className="mb-8 flex items-center space-x-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm w-fit transition-all hover:shadow-md">
        <div className={`p-2 rounded-lg ${isFreelancer ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
          <Label htmlFor="role-mode" className="text-xs font-bold uppercase tracking-wider">
            {isFreelancer ? "Freelancer Mode" : "Client Mode"}
          </Label>
        </div>
        <Switch
          id="role-mode"
          checked={isFreelancer}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-indigo-600"
        />
      </div>

      <div className="animate-in fade-in duration-700">
        {isFreelancer ? (
          <FreelancerDashboard />
        ) : (
          <ClientDashboard />
        )}
      </div>
    </div>
  );
}
