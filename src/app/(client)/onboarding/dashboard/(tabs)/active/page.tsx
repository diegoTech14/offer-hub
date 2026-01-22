"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign, MoreVertical, Briefcase, Plus } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRouter } from "next/navigation";

export default function ActiveProjectPage() {
  const { stats, loading } = useDashboardStats();
  const router = useRouter();

  // Filter active projects
  const activeProjects = stats.projects.filter((p) => p.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Projects</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your ongoing projects</p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {activeProjects.length} Active
        </Badge>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#149A9B]"></div>
        </div>
      ) : activeProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {project.description || "No description available"}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Project Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${parseFloat(project.budget.toString()).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                  {project.category && (
                    <Badge variant="secondary">
                      {project.category}
                    </Badge>
                  )}
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Active
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-[#149A9B] hover:bg-[#128889]">
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Active Projects
            </h3>
            <p className="text-gray-600 text-center mb-4">
              You don't have any active projects at the moment.
            </p>
            <Button 
              className="bg-[#149A9B] hover:bg-[#128889] text-white"
              onClick={() => router.push("/client/create-project")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
