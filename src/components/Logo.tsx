import React from "react";

interface LogoProps {
  /** Variant for different background colors */
  variant?: "light" | "dark";
  /** Size of the logo */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show only the mark (icon) without text */
  markOnly?: boolean;
  /** Optional className for additional styling */
  className?: string;
}

const sizeClasses = {
  sm: "h-8", // 32px - for small navbars
  md: "h-12", // 48px - for headers
  lg: "h-16", // 64px - for home page
  xl: "h-24", // 96px - for landing/hero
};

/**
 * FridgePick Logo Component
 * Supports light and dark variants, multiple sizes, and mark-only mode
 */
export const Logo: React.FC<LogoProps> = ({ variant = "light", size = "md", markOnly = false, className = "" }) => {
  const isDark = variant === "dark";

  // Colors based on variant
  const primaryColor = isDark ? "#F9FAFB" : "#1E293B";
  const accentColor = "#10B981"; // Green stays the same
  const badgeCircleFill = isDark ? "none" : "#FFFFFF";

  if (markOnly) {
    // Icon only version
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56 64"
        role="img"
        aria-label="FridgePick"
        className={`${sizeClasses[size]} ${className}`}
      >
        <title>FridgePick</title>

        {/* Fridge body */}
        <rect x="8" y="6" width="40" height="52" rx="8" ry="8" fill="none" stroke={primaryColor} strokeWidth="2.5" />

        {/* Door divider */}
        <line x1="12" y1="30" x2="44" y2="30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />

        {/* Handles */}
        <rect x="13" y="18" width="4" height="6" rx="2" fill={primaryColor} />
        <rect x="13" y="36" width="4" height="6" rx="2" fill={primaryColor} />

        {/* Planning / "picked" check badge */}
        <circle cx="40" cy="44" r="10" fill={badgeCircleFill} stroke={accentColor} strokeWidth="2" />
        <path
          d="M35 44 L38 47 L45 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // Full logo with wordmark
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 64"
      role="img"
      aria-labelledby="fridgepickTitle fridgepickDesc"
      className={`${sizeClasses[size]} ${className}`}
    >
      <title id="fridgepickTitle">FridgePick</title>
      <desc id="fridgepickDesc">Minimalist logo combining a fridge outline with a checkmark and wordmark.</desc>

      {/* Icon */}
      <g id="fridgepick-mark">
        {/* Fridge body */}
        <rect x="8" y="6" width="40" height="52" rx="8" ry="8" fill="none" stroke={primaryColor} strokeWidth="2.5" />

        {/* Door divider */}
        <line x1="12" y1="30" x2="44" y2="30" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />

        {/* Handles */}
        <rect x="13" y="18" width="4" height="6" rx="2" fill={primaryColor} />
        <rect x="13" y="36" width="4" height="6" rx="2" fill={primaryColor} />

        {/* Planning / "picked" check badge */}
        <circle cx="40" cy="44" r="10" fill={badgeCircleFill} stroke={accentColor} strokeWidth="2" />
        <path
          d="M35 44 L38 47 L45 40"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Wordmark */}
      <g id="fridgepick-wordmark" transform="translate(64, 0)">
        <text
          x="0"
          y="38"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="22"
          letterSpacing="0.5"
          fill={primaryColor}
        >
          Fridge
          <tspan fill={accentColor}>Pick</tspan>
        </text>
      </g>
    </svg>
  );
};

/**
 * Convenience export for common logo variations
 */
export const LogoMark: React.FC<Omit<LogoProps, "markOnly">> = (props) => <Logo {...props} markOnly={true} />;
