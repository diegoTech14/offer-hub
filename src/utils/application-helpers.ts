import { Application, ApplicationFilters, SearchResult, PaginatedResult, ExportOptions } from '@/types/applications.types';

export function validateApplication(input: Partial<Application>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!input.title || input.title.trim().length < 3) errors.push('Title must be at least 3 characters');
  if (!input.summary || input.summary.trim().length < 10) errors.push('Summary must be at least 10 characters');
  if (!input.description || input.description.trim().length < 20) errors.push('Description must be at least 20 characters');
  if (!input.projectType) errors.push('Project type is required');
  if (input.budget !== undefined && input.budget < 0) errors.push('Budget cannot be negative');
  return { valid: errors.length === 0, errors };
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function highlightSnippet(text: string, query: string, length = 80): string {
  const idx = normalizeText(text).indexOf(normalizeText(query));
  if (idx < 0) return text.slice(0, length);
  const start = Math.max(0, idx - 20);
  const end = Math.min(text.length, idx + query.length + 20);
  return `${text.slice(start, end)}...`;
}

export function fullTextSearch(items: Application[], query: string): SearchResult<Application>[] {
  if (!query.trim()) return items.map((item) => ({ item, score: 0 }));
  const q = normalizeText(query);
  const results: SearchResult<Application>[] = [];
  for (const item of items) {
    const weights = { title: 0.5, summary: 0.2, description: 0.2, skills: 0.1 };
    const titleScore = normalizeText(item.title).includes(q) ? weights.title : 0;
    const summaryScore = normalizeText(item.summary).includes(q) ? weights.summary : 0;
    const descScore = normalizeText(item.description).includes(q) ? weights.description : 0;
    const skillsScore = (item.skills || []).some((s) => normalizeText(s).includes(q)) ? weights.skills : 0;
    const score = Math.min(1, titleScore + summaryScore + descScore + skillsScore);
    const highlights = [] as Array<{ field: keyof Application; snippet: string }>;
    if (titleScore) highlights.push({ field: 'title', snippet: highlightSnippet(item.title, query) });
    if (summaryScore) highlights.push({ field: 'summary', snippet: highlightSnippet(item.summary, query) });
    if (descScore) highlights.push({ field: 'description', snippet: highlightSnippet(item.description, query) });
    results.push({ item, score, highlights });
  }
  return results.sort((a, b) => b.score - a.score);
}

export function applyFilters(items: Application[], filters: ApplicationFilters): Application[] {
  return items.filter((app) => {
    if (filters.status && filters.status.length && !filters.status.includes(app.status)) return false;
    if (filters.projectType && filters.projectType.length && !filters.projectType.includes(app.projectType)) return false;
    if (filters.dateRange) {
      const created = new Date(app.createdAt).getTime();
      if (created < filters.dateRange.start.getTime() || created > filters.dateRange.end.getTime()) return false;
    }
    if (filters.minBudget !== undefined && (app.budget || 0) < filters.minBudget) return false;
    if (filters.maxBudget !== undefined && (app.budget || 0) > filters.maxBudget) return false;
    if (filters.skills && filters.skills.length) {
      const s = app.skills || [];
      const ok = filters.skills.every((sk) => s.includes(sk));
      if (!ok) return false;
    }
    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  return { items: pageItems, page: current, pageSize, total, totalPages };
}

export async function exportApplications(apps: Application[], options: ExportOptions): Promise<Blob> {
  const { format, fields, fileName } = options;
  const selected = fields && fields.length ? apps.map((a) => {
    const out: Record<string, any> = {};
    fields.forEach((f) => (out[String(f)] = (a as any)[String(f)]));
    return out;
  }) : apps;

  if (format === 'json') {
    return new Blob([JSON.stringify(selected)], { type: 'application/json' });
  }

  if (format === 'csv') {
    const rows = selected as Record<string, any>[];
    const headers = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const csv = [headers.join(',')].concat(
      rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','))
    ).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }

  // Minimal XLSX-like TSV fallback to avoid heavy deps
  const headers = Array.from(new Set((selected as any[]).flatMap((r) => Object.keys(r))));
  const tsv = [headers.join('\t')].concat(
    (selected as Record<string, any>[]).map((r) => headers.map((h) => String(r[h] ?? '')).join('\t'))
  ).join('\n');
  return new Blob([tsv], { type: 'text/tab-separated-values' });
}