"use client";

import { useState } from "react";
import ProjectPreview, { ProjectData } from "@/components/create-project/project-preview";
import { useRouter } from "next/navigation"; 

export default function ProjectPreviewPage() {
  const router = useRouter();
  
  // Initialize with proper ProjectData structure
  const [projectData, setProjectData] = useState<ProjectData>({
    title: "",
    description: "",
    category: "",
    skills: [],
    budget: {
      amount: 0,
      currency: "USD",
      taxRate: 0,
      platformFee: 0,
    },
    timeline: {
      startDate: "",
      endDate: "",
      milestones: [],
    },
    attachments: [],
    status: "draft",
  });

  const handleEdit = (field: string, value: any) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBack = () => {
    router.back(); // or router.push('/projects')
  };

  const handleSubmit = () => {
    // Submit the project
    console.log("Submitting project:", projectData);
    // Add your submission logic here
    // e.g., await createProject(projectData);
    // router.push('/projects');
  };

  const handleSaveDraft = () => {
    // Save as draft
    console.log("Saving draft:", projectData);
    // Add your draft saving logic here
    // e.g., await saveDraft(projectData);
  };

  return (
    <ProjectPreview
      projectData={projectData}
      onEdit={handleEdit}
      onBack={handleBack}
      onSubmit={handleSubmit}
      onSaveDraft={handleSaveDraft}
    />
  );
}