"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Search,
    Filter,
    ArrowLeft,
    Loader2,
    UserCheck
} from "lucide-react";
import { useProjectDetails } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { talentProfileData as talentMockData } from "@/__mocks__/talent-mock-data";
import TalentCard from "@/components/talent/TalentCard";
import { toast } from "sonner";

export default function AssignFreelancerPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const { project, loading: projectLoading } = useProjectDetails(projectId);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAssigning, setIsAssigning] = useState<string | null>(null);

    // In a real app, we would fetch talents from an API. 
    // Here we use the mock data as recycling existing patterns.
    const talents = useMemo(() => talentMockData, []);

    const filteredTalents = useMemo(() => {
        if (!searchTerm) return talents;
        return talents.filter(
            (talent) =>
                talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                talent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                talent.skills.some((skill) => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [searchTerm, talents]);

    const handleAssign = async (freelancerId: string | number) => {
        setIsAssigning(freelancerId.toString());
        try {
            // The backend expects a PATCH request to /api/projects/:projectId/assign/:freelancerId
            const response = await fetch(`http://localhost:4000/api/projects/${projectId}/assign/${freelancerId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored here
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to assign freelancer");
            }

            toast.success("Freelancer assigned successfully!");
            router.push(`/projects/${projectId}`);
        } catch (error) {
            console.error("Assignment error:", error);
            toast.error("Error assigning freelancer. Make sure you are logged in as the project owner.");
        } finally {
            setIsAssigning(null);
        }
    };

    if (projectLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p>Loading project details...</p>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <Button
                variant="ghost"
                className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Project
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Assign Freelancer</h1>
                <p className="text-muted-foreground">
                    Selecting a freelancer for project: <span className="font-semibold text-foreground">{project.title}</span>
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, title or skill..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredTalents.length > 0 ? (
                    filteredTalents.map((talent) => (
                        <Card key={talent.id} className="overflow-hidden hover:border-teal-500/50 transition-colors">
                            <div className="flex flex-col md:flex-row">
                                <div className="flex-1">
                                    <TalentCard
                                        id={talent.id}
                                        name={talent.name}
                                        title={talent.title}
                                        location={talent.location}
                                        category={talent.category}
                                        rating={talent.rating}
                                        hourlyRate={talent.hourlyRate}
                                        avatar={talent.avatar}
                                        skills={talent.skills}
                                        description={talent.description}
                                        actionText="Assign to Project"
                                        onActionClick={() => handleAssign(talent.id)}
                                        userId="temp-user-id"
                                    />
                                </div>
                                <div className="bg-slate-50 border-t md:border-t-0 md:border-l p-4 flex flex-col justify-center items-center min-w-[200px]">
                                    <Button
                                        className="w-full bg-[#149A9B] hover:bg-[#118283]"
                                        disabled={isAssigning !== null}
                                        onClick={() => handleAssign(talent.id)}
                                    >
                                        {isAssigning === talent.id.toString() ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <UserCheck className="mr-2 h-4 w-4" /> Assign
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-3 uppercase tracking-wider font-semibold">
                                        Recycled Component
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">No freelancers matches your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
