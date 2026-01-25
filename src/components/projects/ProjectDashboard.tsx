"use client"

import { useMemo, useState } from "react"

import withErrorBoundary from "@/components/shared/WithErrorBoundary";
import { ProjectCard } from "@/components/projects/ProjectCard"
import { ProjectTabs } from "@/components/projects/ProjectTabs"
import { ProjectsList } from "@/components/projects/ProjectsList"
import { Button } from "@/components/ui/button"

import { getMockProjects } from "@/__mocks__/projects-list-mock"

import { useProjects } from "@/hooks/use-projects";
import { Loader2, AlertCircle } from "lucide-react";

const TABS = [
  { key: "active", label: "Active project" },
  { key: "completed", label: "Completed" },
  { key: "analytics", label: "Analytics" },
  { key: "dispute", label: "Dispute" },
] as const

type TabKey = (typeof TABS)[number]["key"]

function ProjectDashboard() {
  const [tab, setTab] = useState<TabKey>("active")
  const { projects, loading, error, getProjects } = useProjects({ autoFetch: true });

  const filtered = useMemo(() => {
    if (tab === "analytics") return []

    // Map backend status to tab keys
    // Backend statuses: 'open', 'in_progress', 'completed', 'cancelled', 'dispute'
    return projects.filter((p) => {
      if (tab === "active") return p.status === "in_progress" || p.status === "open";
      if (tab === "completed") return p.status === "completed";
      if (tab === "dispute") return p.status === "dispute";
      return false;
    }).map(p => ({
      id: p.id,
      title: p.title,
      person: p.client?.name || "Client",
      date: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recently",
      status: (p.status === "open" || p.status === "in_progress") ? "active" : p.status as any,
      avatarSrc: p.client?.avatar || "/placeholder.svg?height=40&width=40"
    }));
  }, [tab, projects])

  const handleTabChange = (newTab: string) => {
    setTab(newTab as TabKey);
  };

  return (
    <div className="p-3 sm:p-6">
      <ProjectTabs tabs={TABS} activeTab={tab} onTabChange={handleTabChange} />

      <div className="mx-auto w-full max-w-[680px] mt-3 sm:mt-4 space-y-4">
        {loading.fetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#149A9B] mb-2" />
            <p className="text-sm text-slate-500">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-medium">{error.message}</p>
            <Button variant="outline" className="mt-3 text-xs" onClick={() => getProjects()}>
              Try Again
            </Button>
          </div>
        ) : tab === "analytics" ? (
          <div className="rounded-lg border bg-white p-6 text-center text-slate-500">
            Analytics view - Coming soon
          </div>
        ) : (
          <ProjectsList projects={filtered} />
        )}
      </div>
    </div>
  )
}

export default withErrorBoundary(ProjectDashboard);

