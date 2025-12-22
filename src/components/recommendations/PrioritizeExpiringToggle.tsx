import React from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

interface PrioritizeExpiringToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle switch for prioritizing recipes that use expiring ingredients
 */
export const PrioritizeExpiringToggle: React.FC<PrioritizeExpiringToggleProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  /**
   * Handle toggle change
   */
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  /**
   * Handle keyboard activation
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Priorytetyzuj przepisy wykorzystujace wygasajace skladniki"
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? "bg-amber-500" : "bg-gray-200"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>

      {/* Label */}
      <div className="flex items-center gap-2">
        <ClockIcon className={`w-4 h-4 ${checked ? "text-amber-600" : "text-gray-400"}`} aria-hidden="true" />
        <span className={`text-sm font-medium ${checked ? "text-amber-700" : "text-gray-600"}`}>
          Priorytet: wygasajace
        </span>
      </div>
    </div>
  );
};

PrioritizeExpiringToggle.displayName = "PrioritizeExpiringToggle";
