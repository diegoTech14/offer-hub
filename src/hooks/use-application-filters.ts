"use client";

import { useCallback, useMemo, useState } from 'react';
import { Application, ApplicationFilters, SearchResult } from '@/types/applications.types';
import { applyFilters as applyFiltersUtil, fullTextSearch } from '@/utils/application-helpers';

interface UseApplicationFiltersReturn {
  filters: ApplicationFilters;
  setFilters: (next: ApplicationFilters) => void;
  clearFilters: () => void;
  searchResults: SearchResult<Application>[];
  filtered: Application[];
  search: (query: string) => void;
}

const defaultFilters: ApplicationFilters = {
  status: undefined,
  projectType: undefined,
  dateRange: undefined,
  minBudget: undefined,
  maxBudget: undefined,
  skills: undefined,
  custom: undefined,
  searchQuery: '',
};

export function useApplicationFilters(applications: Application[]): UseApplicationFiltersReturn {
  const [filters, setFiltersState] = useState<ApplicationFilters>(defaultFilters);

  const filtered = useMemo(() => {
    const base = applyFiltersUtil(applications, filters);
    return base;
  }, [applications, filters]);

  const searchResults = useMemo(() => {
    if (!filters.searchQuery) return filtered.map((item) => ({ item, score: 0 }));
    return fullTextSearch(filtered, filters.searchQuery);
  }, [filtered, filters.searchQuery]);

  const setFilters = useCallback((next: ApplicationFilters) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  const search = useCallback((query: string) => {
    setFiltersState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  return {
    filters,
    setFilters,
    clearFilters,
    searchResults,
    filtered,
    search,
  };
}