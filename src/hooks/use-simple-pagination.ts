import { useState, useMemo, useCallback } from 'react';

export interface SimplePaginationOptions<T> {
  items: T[];
  pageSize?: number;
  initialPage?: number;
}

export interface SimplePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  currentItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNext: boolean;
  canPrev: boolean;
  startItem: number;
  endItem: number;
}

export const useSimplePagination = <T>({
  items,
  pageSize = 10,
  initialPage = 1
}: SimplePaginationOptions<T>): SimplePaginationResult<T> => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const [currentPage, setCurrentPage] = useState(() => 
    Math.max(1, Math.min(initialPage, totalPages))
  );

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  }, [currentPage, totalPages, setPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) setPage(currentPage - 1);
  }, [currentPage, setPage]);

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const canNext = currentPage < totalPages;
  const canPrev = currentPage > 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    totalPages,
    totalItems,
    currentItems,
    setPage,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    startItem,
    endItem,
  };
};

export default useSimplePagination;
