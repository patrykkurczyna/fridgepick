import React from 'react';
import { ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { validateSortOption } from '@/types/fridge';
import type { SortOption } from '@/types/fridge';

interface SortControlsProps {
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  disabled?: boolean;
}

/**
 * Dropdown/select do wyboru opcji sortowania produktów
 * Obsługuje: onChange selection, reset to default (expires_at)
 */
export const SortControls: React.FC<SortControlsProps> = ({
  sortBy,
  onSortChange,
  disabled = false
}) => {
  const sortOptions = [
    { value: 'expires_at', label: 'Data ważności', description: 'Od najwcześniej wygasających' },
    { value: 'name', label: 'Nazwa', description: 'Alfabetycznie A-Z' },
    { value: 'created_at', label: 'Data dodania', description: 'Od ostatnio dodanych' }
  ] as const;

  /**
   * Handle sort option change
   */
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (validateSortOption(value)) {
      onSortChange(value);
    } else {
      console.warn('Invalid sort option:', value);
    }
  };

  /**
   * Reset to default sort
   */
  const handleReset = () => {
    onSortChange('expires_at');
  };

  const currentOption = sortOptions.find(option => option.value === sortBy);
  const isDefaultSort = sortBy === 'expires_at';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-sm text-gray-600">
        <ArrowsUpDownIcon className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Sortuj:</span>
      </div>

      <div className="relative">
        <select
          value={sortBy}
          onChange={handleSortChange}
          disabled={disabled}
          className={`
            appearance-none bg-white border border-gray-300 rounded-lg
            pl-3 pr-8 py-2 text-sm font-medium
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-500
            hover:border-gray-400 transition-colors
            min-w-[140px] cursor-pointer disabled:cursor-not-allowed
          `}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Reset button (only show if not default) */}
      {!isDefaultSort && !disabled && (
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
        >
          Resetuj
        </button>
      )}

      {/* Sort description (hidden on mobile) */}
      {currentOption && (
        <span className="hidden lg:inline text-xs text-gray-500 ml-1">
          {currentOption.description}
        </span>
      )}
    </div>
  );
};