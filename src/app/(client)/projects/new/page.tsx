"use client";

import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

export default function NewProjectPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Project</h1>
                <p className="text-muted-foreground">
                    Fill in the details below to post your project and find the best freelancers.
                </p>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
                <CreateProjectForm />
            </div>
        </div>
    );
}
