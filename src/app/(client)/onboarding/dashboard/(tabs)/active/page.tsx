"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign, MoreVertical, Briefcase, Plus } from "lucide-react";

export default function ActiveProjectPage() {
  // Mock data - replace with real data from API
  const activeProjects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      client: "TechCorp Inc.",
      freelancer: "Alex Johnson",
      budget: "$5,000",
      progress: 65,
      dueDate: "Dec 20, 2025",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      client: "StartupXYZ",
      freelancer: "Sarah Williams",
      budget: "$3,500",
      progress: 40,
      dueDate: "Dec 25, 2025",
      status: "In Progress",
    },
  ];

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
      {activeProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {activeProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Client: {project.client} • Freelancer: {project.freelancer}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#149A9B] h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{project.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Due: {project.dueDate}</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    {project.status}
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
            <Button className="bg-[#149A9B] hover:bg-[#128889] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
