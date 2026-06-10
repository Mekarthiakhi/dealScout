import { useState, useMemo } from 'react';

interface UsePaginationProps {
  items: any[];
  itemsPerPage?: number;
}

/**
 * Custom hook for pagination
 * Manages current page, items per page, and navigation
 */
export function usePagination({ items, itemsPerPage = 12 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      itemsPerPage,
      totalItems: items.length,
    };
  }, [items, itemsPerPage, currentPage]);

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(items.length / itemsPerPage);
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const resetPage = () => setCurrentPage(1);

  return { ...paginationData, goToPage, nextPage, prevPage, resetPage };
}

export default usePagination;
