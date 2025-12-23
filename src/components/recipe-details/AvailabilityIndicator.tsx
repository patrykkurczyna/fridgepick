import React from "react";
import { CheckCircleIcon, ExclamationCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import type { AvailabilityIndicatorProps, IngredientAvailabilityStatus } from "@/types/recipe-details";

/**
 * Configuration for availability status styling
 */
const STATUS_CONFIG: Record<
  IngredientAvailabilityStatus,
  {
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    label: string;
  }
> = {
  available: {
    icon: CheckCircleIcon,
    colorClass: "text-green-600",
    bgClass: "bg-green-100",
    label: "Dostępny",
  },
  partial: {
    icon: ExclamationCircleIcon,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-100",
    label: "Częściowo dostępny",
  },
  missing: {
    icon: XCircleIcon,
    colorClass: "text-red-500",
    bgClass: "bg-red-100",
    label: "Brak",
  },
};

/**
 * Wizualny wskaźnik dostępności składnika
 * Trzy stany: dostępny (zielony), częściowo dostępny (żółty), brak (czerwony)
 */
export const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  status,
  requiredQuantity,
  userQuantity,
  unit,
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  /**
   * Format quantity with unit
   */
  const formatQuantity = (quantity: number, unitLabel: string): string => {
    // Round to 1 decimal place if needed
    const formatted = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1);
    return `${formatted} ${unitLabel}`;
  };

  /**
   * Generate tooltip text
   */
  const getTooltipText = (): string => {
    switch (status) {
      case "available":
        return `Masz ${formatQuantity(userQuantity, unit)} (potrzeba ${formatQuantity(requiredQuantity, unit)})`;
      case "partial":
        return `Masz tylko ${formatQuantity(userQuantity, unit)} z ${formatQuantity(requiredQuantity, unit)}`;
      case "missing":
        return `Brak w lodówce (potrzeba ${formatQuantity(requiredQuantity, unit)})`;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${config.bgClass} cursor-help`}
      title={getTooltipText()}
      aria-label={`${config.label}: ${getTooltipText()}`}
    >
      <Icon className={`w-4 h-4 ${config.colorClass}`} />
    </div>
  );
};
