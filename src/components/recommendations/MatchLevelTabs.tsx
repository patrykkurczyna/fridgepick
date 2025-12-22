import React from "react";
import type { MatchLevelTabsProps, MatchLevelTab } from "@/types/recommendations";
import { MATCH_LEVEL_CONFIG } from "@/types/recommendations";

/** Tab configuration including "all" option */
interface TabConfig {
  key: MatchLevelTab;
  label: string;
  activeClass: string;
  inactiveClass: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    key: "all",
    label: "Wszystkie",
    activeClass: "bg-blue-600 text-white border-blue-600",
    inactiveClass: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
  },
  {
    key: "idealny",
    label: MATCH_LEVEL_CONFIG["idealny"].label,
    activeClass: "bg-green-600 text-white border-green-600",
    inactiveClass: "bg-white text-green-700 border-green-300 hover:bg-green-50",
  },
  {
    key: "prawie idealny",
    label: MATCH_LEVEL_CONFIG["prawie idealny"].label,
    activeClass: "bg-yellow-500 text-white border-yellow-500",
    inactiveClass: "bg-white text-yellow-700 border-yellow-300 hover:bg-yellow-50",
  },
  {
    key: "wymaga dokupienia",
    label: MATCH_LEVEL_CONFIG["wymaga dokupienia"].label,
    activeClass: "bg-red-600 text-white border-red-600",
    inactiveClass: "bg-white text-red-700 border-red-300 hover:bg-red-50",
  },
];

/**
 * Tab navigation for filtering displayed recommendations by match level
 * Client-side filtering without new API calls
 */
export const MatchLevelTabs: React.FC<MatchLevelTabsProps> = ({ activeLevel, counts, onChange, disabled }) => {
  /**
   * Handle tab click
   */
  const handleTabClick = (level: MatchLevelTab) => {
    if (!disabled) {
      onChange(level);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e: React.KeyboardEvent, level: MatchLevelTab) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTabClick(level);
    }
  };

  /**
   * Get count for a specific level
   */
  const getCount = (level: MatchLevelTab): number => {
    return counts[level];
  };

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtruj po poziomie dopasowania">
      {TAB_CONFIGS.map((tab) => {
        const isActive = activeLevel === tab.key;
        const count = getCount(tab.key);

        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`recommendations-panel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => handleTabClick(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, tab.key)}
            disabled={disabled}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm
              transition-all duration-200 cursor-pointer
              ${isActive ? tab.activeClass : tab.inactiveClass}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            `}
          >
            <span>{tab.label}</span>
            <span
              className={`
                inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-bold
                ${isActive ? "bg-white/20 text-inherit" : "bg-gray-100 text-gray-600"}
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

MatchLevelTabs.displayName = "MatchLevelTabs";
