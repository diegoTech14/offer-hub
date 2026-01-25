"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export default function ClientProjectsPage() {
    const { projects, getProjects, loading, error } = useProjects({
        autoFetch: true,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open":
                return <Badge variant="success">Open</Badge>;
            case "in_progress":
                return <Badge variant="pending">In Progress</Badge>;
            case "completed":
                return <Badge variant="info">Completed</Badge>;
            case "cancelled":
                return <Badge variant="error">Cancelled</Badge>;
            default:
                return <Badge variant="default">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">Manage and track all your posted projects.</p>
                </div>
                <Link href="/projects/new">
                    <Button className="bg-[#149A9B] hover:bg-[#118283]">
                        <Plus className="mr-2 h-4 w-4" /> Post New Project
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search projects..." className="pl-10" />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            {loading.fetching ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Loading your projects...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
                    <p className="font-medium mb-2">Error loading projects</p>
                    <p className="text-sm opacity-90">{error.message}</p>
                    <Button variant="outline" className="mt-4" onClick={() => getProjects()}>
                        Try Again
                    </Button>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-12 text-center">
                    <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-6">You haven't posted any projects yet.</p>
                    <Link href="/projects/new">
                        <Button variant="outline">Create your first project</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    {getStatusBadge(project.status)}
                                    <div className="text-sm font-semibold text-slate-900">
                                        {project.budget} {project.currency || "XLM"}
                                    </div>
                                </div>
                                <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 min-h-[40px]">
                                    {project.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-3">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Deadline:</span>
                                        <span>{project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="capitalize">{project.category || "General"}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t flex flex-wrap gap-2">
                                <Link href={`/projects/${project.id}`} className="flex-1 min-w-[100px]">
                                    <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                                </Link>
                                {project.status === "open" && (
                                    <>
                                        <Link href={`/projects/${project.id}/edit`} className="flex-1 min-w-[100px]">
                                            <Button variant="outline" size="sm" className="w-full text-xs">Edit</Button>
                                        </Link>
                                        <Link href={`/projects/${project.id}/assign`} className="flex-1 min-w-[100px]">
                                            <Button size="sm" className="w-full text-xs bg-[#149A9B] hover:bg-[#118283]">Assign</Button>
                                        </Link>
                                    </>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
