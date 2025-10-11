"use client";

import Navbar from "@/components/layout/navbar";
import { ClientSidebar } from "@/components/client-dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Plus, Clock, DollarSign } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "Website Redesign",
      status: "In Progress",
      budget: "$2,500",
      deadline: "Dec 25, 2025",
      freelancer: "Alex Johnson",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar showAuth={true} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64">
          <ClientSidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                <p className="text-gray-600 mt-1">Manage all your projects in one place</p>
              </div>
              <Button className="bg-[#149A9B] hover:bg-[#128889] text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Freelancer: {project.freelancer}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>{project.budget}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Due: {project.deadline}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 bg-[#149A9B] hover:bg-[#128889]">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


