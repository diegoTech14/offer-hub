"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    DollarSign,
    Tag,
    Clock,
    User,
    Briefcase,
    CheckCircle2,
    ArrowLeft,
    Loader2,
    ExternalLink
} from "lucide-react";
import { useProjectDetails } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Link from "next/link";

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const { project, loading, error } = useProjectDetails(projectId);

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
                return <Badge variant="default" className="capitalize">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading project details...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="container mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                    <p className="mb-6">{error?.message || "The project you are looking for does not exist or you don't have permission to view it."}</p>
                    <Button onClick={() => router.back()} variant="outline">
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <Button
                variant="ghost"
                className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {getStatusBadge(project.status)}
                            <span className="text-sm text-muted-foreground">Posted on {format(new Date(project.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">{project.title}</h1>
                        <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1.5 font-medium">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span>{project.budget} {project.currency || "XLM"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                <Tag className="h-4 w-4" />
                                <span className="capitalize">{project.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>Deadline: {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Project Description</h2>
                        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </div>
                    </div>

                    {project.skills && project.skills.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.skills.map((skill) => (
                                    <Badge key={skill} variant="default" className="px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {project.onChainTxHash && (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-slate-900 mb-1">On-chain Registered</h4>
                                        <p className="text-sm text-slate-600 mb-3">This project is officially published on the Stellar network (Soroban).</p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs bg-white border px-2 py-1 rounded truncate flex-1">
                                                {project.onChainTxHash}
                                            </code>
                                            <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 p-0 px-2" asChild>
                                                <a href={`https://stellar.expert/explorer/public/tx/${project.onChainTxHash}`} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Project Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Current Status</span>
                                <span className="font-semibold capitalize">{project.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Budget</span>
                                <span className="font-semibold">{project.budget} {project.currency || "XLM"}</span>
                            </div>

                            {project.status === "open" && (
                                <div className="pt-4">
                                    <Link href={`/projects/${project.id}/assign`} className="w-full">
                                        <Button className="w-full bg-[#149A9B] hover:bg-[#118283]">
                                            <Briefcase className="mr-2 h-4 w-4" /> Assign Freelancer
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Freelancer Info if assigned */}
                    {project.freelancer_id && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Assigned Freelancer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-neutral-200 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Freelancer User</p>
                                        <p className="text-xs text-muted-foreground">ID: {project.freelancer_id}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/talent/${project.freelancer_id}`}>View Profile</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full" disabled>
                                Edit Project
                            </Button>
                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
                                Cancel Project
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
