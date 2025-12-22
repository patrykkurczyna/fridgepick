import React from "react";
import type { ProteinTypeFilterProps } from "@/types/recipes";
import { PROTEIN_TYPE_OPTIONS } from "@/types/recipes";

/**
 * Filter control for selecting protein type
 * Displays as a dropdown with Polish labels
 */
export const ProteinTypeFilter: React.FC<ProteinTypeFilterProps> = ({ value, onChange, disabled = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === "" ? null : (selectedValue as typeof value));
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="protein-type-filter" className="text-sm font-medium text-gray-700">
        Rodzaj białka
      </label>
      <select
        id="protein-type-filter"
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer transition-colors"
      >
        {PROTEIN_TYPE_OPTIONS.map((option) => (
          <option key={option.label} value={option.value ?? ""}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
