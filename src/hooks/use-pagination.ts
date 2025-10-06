import { useCallback, useMemo, useState } from "react";

export type PaginationEllipsisToken = "ellipsis";
export type PaginationPageElement = number | PaginationEllipsisToken;

export interface UsePaginationOptions<T> {
  items: T[];
  pageSize?: number; // items per page
  initialPage?: number; // 1-based
  maxVisiblePages?: number; // window size for numeric buttons excluding first/last and ellipsis
}

export interface UsePaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  currentItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNext: boolean;
  canPrev: boolean;
  range: PaginationPageElement[]; // sequence of page numbers + 'ellipsis'
  startItem: number; // 1-based index of first item shown this page
  endItem: number; // 1-based index of last item shown this page
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const usePagination = <T,>(options: UsePaginationOptions<T>): UsePaginationResult<T> => {
  const { items, pageSize = 6, initialPage = 1, maxVisiblePages = 5 } = options;
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [currentPage, _setCurrentPage] = useState(() => clamp(initialPage, 1, totalPages));

  const setPage = useCallback((page: number) => {
    _setCurrentPage(clamp(page, 1, totalPages));
  }, [totalPages]);

  const nextPage = useCallback(() => setPage(currentPage + 1), [currentPage, setPage]);
  const prevPage = useCallback(() => setPage(currentPage - 1), [currentPage, setPage]);

  const canNext = currentPage < totalPages;
  const canPrev = currentPage > 1;

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const range = useMemo<PaginationPageElement[]>(() => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: PaginationPageElement[] = [];

    const showEllipsis = (arr: PaginationPageElement[]) => {
      if (arr[arr.length - 1] !== "ellipsis") arr.push("ellipsis");
    };

    const firstPage = 1;
    const lastPage = totalPages;

    pages.push(firstPage);

    const windowSize = 3; // pages around current
    const start = clamp(currentPage - 1, 2, lastPage - 1);
    const windowStart = clamp(start - 1, 2, lastPage - windowSize);
    const windowEnd = clamp(windowStart + windowSize - 1, 2, lastPage - 1);

    if (windowStart > 2) {
      showEllipsis(pages);
    }

    for (let p = windowStart; p <= windowEnd; p++) {
      pages.push(p);
    }

    if (windowEnd < lastPage - 1) {
      showEllipsis(pages);
    }

    if (lastPage !== firstPage) pages.push(lastPage);

    return pages;
  }, [totalPages, maxVisiblePages, currentPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentItems,
    setPage,
    nextPage,
    prevPage,
    canNext,
    canPrev,
    range,
    startItem,
    endItem,
  };
};

export default usePagination;
