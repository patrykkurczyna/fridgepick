import React from "react";
import { Logo } from "./Logo";

interface AppNavigationProps {
  /** Optional children to render in the navigation (e.g., user menu, actions) */
  children?: React.ReactNode;
  /** Current active page for highlighting */
  currentPage?: "home" | "fridge" | "recipes" | "meal-plan";
  /** Variant for different background colors */
  variant?: "light" | "dark";
}

/**
 * Main application navigation with logo
 * Can be used as a consistent header across all pages
 */
export const AppNavigation: React.FC<AppNavigationProps> = ({ children, currentPage, variant = "light" }) => {
  const navLinks = [
    { href: "/fridge", label: "Lodówka", page: "fridge" as const },
    { href: "/recipes", label: "Przepisy", page: "recipes" as const },
    { href: "/meal-plan", label: "Plan", page: "meal-plan" as const },
  ];

  const bgClass = variant === "dark" ? "bg-gray-900" : "bg-white";
  const borderClass = variant === "dark" ? "border-gray-800" : "border-gray-200";
  const textClass = variant === "dark" ? "text-gray-300" : "text-gray-600";
  const hoverClass = variant === "dark" ? "hover:text-white" : "hover:text-gray-900";
  const activeClass = variant === "dark" ? "text-white border-emerald-500" : "text-gray-900 border-emerald-500";

  return (
    <nav className={`${bgClass} shadow-sm border-b ${borderClass}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
            aria-label="FridgePick - Strona główna"
          >
            <Logo size="sm" variant={variant} />
          </a>

          {/* Navigation Links - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.page}
                href={link.href}
                className={`
                  text-sm font-medium transition-colors border-b-2 pb-0.5 cursor-pointer
                  ${currentPage === link.page ? activeClass : `border-transparent ${textClass} ${hoverClass}`}
                `}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Additional content (user menu, actions, etc.) */}
          {children && <div className="flex items-center space-x-4">{children}</div>}
        </div>

        {/* Mobile Navigation - Bottom tabs style */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <div className="flex items-center justify-around">
            {navLinks.map((link) => (
              <a
                key={link.page}
                href={link.href}
                className={`
                  text-xs font-medium transition-colors px-3 py-2 rounded-md cursor-pointer
                  ${currentPage === link.page ? "bg-emerald-50 text-emerald-700" : `${textClass} ${hoverClass}`}
                `}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
