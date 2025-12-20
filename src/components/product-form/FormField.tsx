import React from "react";
import type { FormFieldProps } from "@/types/product-form";

/**
 * Reusable wrapper dla pól formularza z label, input i error message
 */
export const FormField: React.FC<FormFieldProps> = ({ label, error, required = false, children }) => {
  return (
    <div className="form-field mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={`${error ? "border-red-300" : ""}`}>{children}</div>

      {error && <div className="validation-message mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
};
