import React from 'react';
import type { CategoryDropdownProps } from '@/types/product-form';

/**
 * Select dropdown z kategoriami produktów pobranimi z API
 */
export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  value,
  onChange,
  error
}) => {
  return (
    <select
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
        error ? 'border-red-300' : 'border-gray-300'
      }`}
      value={value || ''}
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (selectedValue) {
          onChange(parseInt(selectedValue, 10));
        }
      }}
    >
      <option value="">Wybierz kategorię...</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
};