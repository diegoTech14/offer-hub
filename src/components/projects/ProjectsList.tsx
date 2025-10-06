"use client"

import { ProjectCard } from "@/components/projects/ProjectCard"
import { MoreHorizontal } from "lucide-react"
import EmptyState from "@/components/ui/empty-state"
import type { Project } from "@/lib/mockData/projects-list-mock"
import { usePagination } from "@/hooks/use-pagination"
import { StandardPaginationControls } from "@/components/ui/pagination"

interface ProjectsListProps {
  projects: Project[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const pagination = usePagination<Project>({ items: projects, pageSize: 6 })

  if (projects.length === 0) {
    return <EmptyState message="No projects available." />
  }

  return (
    <div className="flex flex-col gap-4">
      {pagination.currentItems.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          person={project.person}
          date={project.date}
          avatarSrc={project.avatarSrc}
          menuIcon={<MoreHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />}
        />
      ))}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <p className="text-sm text-muted-foreground">
          Showing {pagination.startItem}–{pagination.endItem} of {pagination.totalItems} projects
        </p>
        <StandardPaginationControls
          page={pagination.currentPage}
          range={pagination.range}
          canPrev={pagination.canPrev}
          canNext={pagination.canNext}
          onPrev={pagination.prevPage}
            onNext={pagination.nextPage}
          onPageChange={pagination.setPage}
        />
      </div>
    </div>
  )
}

