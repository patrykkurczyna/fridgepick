import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { validatePaginationParams } from '@/types/fridge';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

/**
 * Kontrolki paginacji dla dużej liczby produktów
 * Obsługuje: page navigation, previous/next, jump to first/last, disabled states
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  showInfo = true
}) => {
  // Validate pagination parameters
  const { isValid, normalizedPage } = validatePaginationParams(currentPage, totalPages);
  
  if (!isValid && currentPage !== normalizedPage) {
    onPageChange(normalizedPage);
    return null;
  }

  // Don't render if only one page
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generate page numbers to show
   */
  const getVisiblePages = (): number[] => {
    const delta = 2; // Number of pages to show on each side
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    // Always include first page
    range.push(1);

    // Add pages around current page
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    // Always include last page (if not already included)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Remove duplicates and sort
    const uniqueRange = [...new Set(range)].sort((a, b) => a - b);

    // Add dots where there are gaps
    let prev = 0;
    for (const page of uniqueRange) {
      if (page - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    }

    return rangeWithDots.filter(p => typeof p === 'number') as number[];
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  /**
   * Handle page change with validation
   */
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  /**
   * Handle previous page
   */
  const handlePrevious = () => {
    if (!isFirstPage) {
      handlePageChange(currentPage - 1);
    }
  };

  /**
   * Handle next page
   */
  const handleNext = () => {
    if (!isLastPage) {
      handlePageChange(currentPage + 1);
    }
  };

  const startItem = (currentPage - 1) * 20 + 1; // Assuming 20 items per page
  const endItem = Math.min(currentPage * 20, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-4 py-3 border border-gray-200 rounded-lg">
      {/* Items info */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Pokazano <span className="font-medium">{startItem}</span> do{' '}
          <span className="font-medium">{endItem}</span> z{' '}
          <span className="font-medium">{totalItems}</span> produktów
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={isFirstPage}
          className={`
            relative inline-flex items-center px-2 py-2 rounded-l-lg text-sm font-medium
            ${isFirstPage 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
          `}
          aria-label="Poprzednia strona"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex">
          {visiblePages.map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`
                relative inline-flex items-center px-4 py-2 text-sm font-medium
                ${page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700">
          {currentPage} / {totalPages}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className={`
            relative inline-flex items-center px-2 py-2 rounded-r-lg text-sm font-medium
            ${isLastPage 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
          `}
          aria-label="Następna strona"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Jump to page (desktop only) */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm text-gray-600">Idź do strony:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value=""
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page && page >= 1 && page <= totalPages) {
              handlePageChange(page);
              e.target.value = '';
            }
          }}
          placeholder={currentPage.toString()}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};