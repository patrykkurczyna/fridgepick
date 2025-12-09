import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { validateSearchQuery } from '@/types/fridge';

interface SearchBarProps {
  query: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Input do wyszukiwania produktów po nazwie z debounced search
 * Obsługuje: onChange z debounce, onClear, onSubmit (Enter key)
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onSearch,
  placeholder = "Szukaj produktów...",
  disabled = false
}) => {
  const [localValue, setLocalValue] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external query changes
  useEffect(() => {
    setLocalValue(query);
  }, [query]);

  /**
   * Handle input change with validation and debounce
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update local state immediately for responsive UI
    setLocalValue(value);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Validate input
    const { isValid, sanitized } = validateSearchQuery(value);
    
    // Set loading state for visual feedback
    if (value.trim().length >= 2) {
      setIsSearching(true);
    }

    // Debounced API call
    timeoutRef.current = setTimeout(() => {
      setIsSearching(false);
      
      if (isValid) {
        onSearch(sanitized);
      } else {
        // If invalid, use sanitized version
        setLocalValue(sanitized);
        onSearch(sanitized);
      }
    }, 300);
  };

  /**
   * Handle form submit (Enter key)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear timeout and trigger immediate search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const { isValid, sanitized } = validateSearchQuery(localValue);
    setIsSearching(false);
    
    if (isValid) {
      onSearch(sanitized);
    } else {
      setLocalValue(sanitized);
      onSearch(sanitized);
    }
  };

  /**
   * Clear search query
   */
  const handleClear = () => {
    setLocalValue('');
    setIsSearching(false);
    onSearch('');
    
    // Focus input after clear
    inputRef.current?.focus();
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showClearButton = localValue.length > 0;
  const showSearchingIndicator = isSearching && localValue.length >= 2;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon 
            className={`w-5 h-5 transition-colors ${
              showSearchingIndicator ? 'text-blue-500' : 'text-gray-400'
            }`} 
          />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="search"
          value={localValue}
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
          {showSearchingIndicator && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
          )}
          
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

      {/* Validation feedback */}
      {localValue.length > 100 && (
        <p className="mt-1 text-xs text-red-600">
          Wyszukiwanie może zawierać maksymalnie 100 znaków
        </p>
      )}
      
      {localValue.length > 0 && localValue.length < 2 && (
        <p className="mt-1 text-xs text-gray-500">
          Wprowadź co najmniej 2 znaki aby wyszukać
        </p>
      )}
    </form>
  );
};