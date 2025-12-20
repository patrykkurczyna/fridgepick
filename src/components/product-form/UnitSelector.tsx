import React from "react";
import type { UnitSelectorProps } from "@/types/product-form";
import { UNIT_TYPES } from "@/types";

/**
 * Select dropdown z jednostkami miary zdefiniowanymi w unit_type enum
 */
export const UnitSelector: React.FC<UnitSelectorProps> = ({ value, onChange, error }) => {
  const unitLabels = {
    g: "gramy (g)",
    l: "litry (l)",
    szt: "sztuki (szt)",
  };

  return (
    <select
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
        error ? "border-red-300" : "border-gray-300"
      }`}
      value={value || ""}
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (selectedValue && UNIT_TYPES.includes(selectedValue as DatabaseEnums["unit_type"])) {
          onChange(selectedValue as DatabaseEnums["unit_type"]);
        }
      }}
    >
      <option value="">Wybierz jednostkę...</option>
      {UNIT_TYPES.map((unit) => (
        <option key={unit} value={unit}>
          {unitLabels[unit]}
        </option>
      ))}
    </select>
  );
};
