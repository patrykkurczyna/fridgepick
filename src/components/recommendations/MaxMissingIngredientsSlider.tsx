import React from "react";

interface MaxMissingIngredientsSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** Labels for slider values */
const SLIDER_LABELS: Record<number, string> = {
  0: "Tylko dostepne",
  1: "1 brakujacy",
  2: "2 brakujace",
  3: "3 brakujace",
  4: "4 brakujace",
  5: "5 brakujacych",
};

/**
 * Slider component for setting maximum number of missing ingredients
 * Range: 0-5, Step: 1
 */
export const MaxMissingIngredientsSlider: React.FC<MaxMissingIngredientsSliderProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  /**
   * Handle slider change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const label = SLIDER_LABELS[value] || `${value} brakujacych`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="max-missing-slider" className="text-sm font-medium text-gray-700">
          Maks. brakujacych skladnikow
        </label>
        <span className="text-sm font-semibold text-blue-600">{label}</span>
      </div>

      <div className="relative">
        <input
          id="max-missing-slider"
          type="range"
          min={0}
          max={5}
          step={1}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
            accent-blue-600
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={value}
          aria-valuetext={label}
        />

        {/* Tick marks */}
        <div className="flex justify-between px-1 mt-1">
          {[0, 1, 2, 3, 4, 5].map((tick) => (
            <span key={tick} className={`text-xs ${value === tick ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

MaxMissingIngredientsSlider.displayName = "MaxMissingIngredientsSlider";
