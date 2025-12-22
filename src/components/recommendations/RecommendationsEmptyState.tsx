import React from "react";
import { SparklesIcon, PlusIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import type { RecommendationsEmptyStateProps } from "@/types/recommendations";

/**
 * Configuration for different empty state reasons
 */
interface EmptyStateConfig {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  actionLabel: string;
  actionIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const EMPTY_STATE_CONFIGS: Record<RecommendationsEmptyStateProps["reason"], EmptyStateConfig> = {
  "no-products": {
    icon: SparklesIcon,
    title: "Dodaj produkty do lodowki",
    description:
      "Aby otrzymac rekomendacje przepisow, najpierw dodaj produkty do swojej lodowki. AI dopasuje przepisy na podstawie Twoich skladnikow.",
    actionLabel: "Dodaj produkty",
    actionIcon: PlusIcon,
  },
  "no-matches": {
    icon: SparklesIcon,
    title: "Brak dopasowanych przepisow",
    description:
      "Nie znaleziono przepisow pasujacych do Twoich skladnikow. Sprobuj dodac wiecej produktow lub zmniejszyc restrykcje filtrow.",
    actionLabel: "Dodaj produkty",
    actionIcon: PlusIcon,
  },
  "filters-too-strict": {
    icon: AdjustmentsHorizontalIcon,
    title: "Filtry sa zbyt restrykcyjne",
    description:
      "Obecne ustawienia filtrow nie pozwalaja na znalezienie przepisow. Sprobuj zwiekszyc maksymalna liczbe brakujacych skladnikow lub usunac filtry.",
    actionLabel: "Wyczysc filtry",
    actionIcon: AdjustmentsHorizontalIcon,
  },
};

/**
 * Empty state shown when no recommendations are available
 * Displays contextual message based on the reason
 */
export const RecommendationsEmptyState: React.FC<RecommendationsEmptyStateProps> = ({
  reason,
  onAction,
  hasActiveFilters,
}) => {
  // Use filters-too-strict message if there are active filters and no matches
  const effectiveReason = reason === "no-matches" && hasActiveFilters ? "filters-too-strict" : reason;
  const config = EMPTY_STATE_CONFIGS[effectiveReason];
  const IconComponent = config.icon;
  const ActionIconComponent = config.actionIcon;

  /**
   * Handle action button click
   */
  const handleAction = () => {
    if (effectiveReason === "filters-too-strict") {
      onAction();
    } else {
      // Navigate to fridge page
      window.location.href = "/fridge";
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <IconComponent className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{config.title}</h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">{config.description}</p>

        {/* Action button */}
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ActionIconComponent className="w-5 h-5" aria-hidden="true" />
          {config.actionLabel}
        </button>

        {/* Additional tips for no-products state */}
        {effectiveReason === "no-products" && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Wskazowka</h4>
            <p className="text-sm text-blue-800">
              Dodawaj produkty z datami waznosci, aby AI moglo rekomendowac przepisy wykorzystujace skladniki bliskie
              wygasnieciu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

RecommendationsEmptyState.displayName = "RecommendationsEmptyState";
