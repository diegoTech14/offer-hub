"use client";

import { useMemo } from 'react';
import { Application, ApplicationStats, ApplicationStatus, ProjectType } from '@/types/applications.types';

export function useApplicationStats(applications: Application[]): ApplicationStats {
  return useMemo(() => {
    const total = applications.length;

    const byStatus: Record<ApplicationStatus, number> = {
      draft: 0,
      submitted: 0,
      in_review: 0,
      approved: 0,
      rejected: 0,
      archived: 0,
    } as Record<ApplicationStatus, number>;

    const byProjectType: Record<ProjectType, number> = {
      development: 0,
      design: 0,
      marketing: 0,
      writing: 0,
      consulting: 0,
      other: 0,
    } as Record<ProjectType, number>;

    const skillsFrequency: Record<string, number> = {};

    let budgetSum = 0;
    let budgetCount = 0;

    const monthly: Map<string, number> = new Map();

    applications.forEach((app) => {
      byStatus[app.status] = (byStatus[app.status] ?? 0) + 1;
      byProjectType[app.projectType] = (byProjectType[app.projectType] ?? 0) + 1;

      if (app.skills) {
        app.skills.forEach((s) => {
          skillsFrequency[s] = (skillsFrequency[s] ?? 0) + 1;
        });
      }

      if (typeof app.budget === 'number') {
        budgetSum += app.budget;
        budgetCount += 1;
      }

      const d = new Date(app.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly.set(key, (monthly.get(key) ?? 0) + 1);
    });

    const averageBudget = budgetCount ? budgetSum / budgetCount : undefined;
    const createdMonthly = Array.from(monthly.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([month, count]) => ({ month, count }));

    return {
      total,
      byStatus,
      byProjectType,
      averageBudget,
      skillsFrequency,
      createdMonthly,
    };
  }, [applications]);
}