"use client";

import ProjectCard from "./ProjectCard";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function CompletedProjectsList() {
  const { stats, loading } = useDashboardStats();
  
  // Filter completed projects
  const completedProjects = stats.projects.filter((p) => p.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#149A9B]"></div>
      </div>
    );
  }

  if (completedProjects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Completed Projects
          </h3>
          <p className="text-gray-600 text-center">
            You haven't completed any projects yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-1 space-y-4">
      {completedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          freelancerName="Freelancer"
          freelancerAvatar="/avatar.png"
          dateRange={new Date(project.created_at).toLocaleDateString()}
        />
      ))}
    </div>
  );
}


