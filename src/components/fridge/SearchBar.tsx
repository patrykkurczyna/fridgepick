import React, { useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { validateSearchQuery } from '@/types/fridge';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Prosty controlled input do wyszukiwania produktów po nazwie
 * Obsługuje: onChange (debounce w parent hook), onClear, Escape key
 */
export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  query,
  onSearch,
  placeholder = "Szukaj produktów...",
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle input change - directly call onSearch without debounce
   * (debounce is handled by parent hook)
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const { isValid, sanitized } = validateSearchQuery(value);

    // Call parent handler immediately - parent will debounce
    onSearch(isValid ? sanitized : value);
  };

  // Sync external query to input value when it changes externally (e.g., clear button)
  React.useEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = query;
    }
  }, [query]);

  /**
   * Handle form submit (Enter key)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission is handled by onChange, nothing extra needed
  };

  /**
   * Clear search query
   */
  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onSearch('');
    inputRef.current?.focus();
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key clears search
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const showClearButton = query.length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
        </div>

        {/* Input Field - UNCONTROLLED to preserve focus */}
        <input
          ref={inputRef}
          type="text"
          defaultValue={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-3
            border border-gray-300 rounded-lg
            bg-white text-gray-900 placeholder-gray-500
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:text-gray-500
            transition-colors duration-200
          `}
          maxLength={100}
          autoComplete="off"
          spellCheck="false"
        />

        {/* Right side icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {showClearButton && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
              aria-label="Wyczyść wyszukiwanie"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Note: Validation feedback removed to keep component simple and preserve focus */}
    </form>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if props actually change
  return (
    prevProps.query === nextProps.query &&
    prevProps.onSearch === nextProps.onSearch &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.disabled === nextProps.disabled
  );
});