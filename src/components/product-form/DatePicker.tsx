import React from "react";
import type { DatePickerProps } from "@/types/product-form";

/**
 * Accessible date input dla daty ważności produktu
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  error,
  placeholder = "Wybierz datę ważności...",
}) => {
  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange(value || null);
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  const hasValue = !!value;

  return (
    <div className="relative">
      <input
        type="date"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
          error ? "border-red-300" : "border-gray-300"
        } ${!hasValue ? "text-gray-400" : "text-gray-900"}`}
        value={formatDateForInput(value)}
        onChange={handleDateChange}
        min={today}
        aria-label="Data ważności produktu"
        aria-describedby={error ? "date-error" : undefined}
      />

      {/* Helper text below the input */}
      {!hasValue && <p className="mt-1 text-xs text-gray-500">{placeholder}</p>}
    </div>
  );
};
