import React, { useState, useEffect } from "react";
import {
  ArchiveBoxIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  ArchiveBoxIcon as ArchiveBoxIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
} from "@heroicons/react/24/solid";
import { Logo } from "@/components/Logo";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconActive: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: "Lodówka",
    href: "/fridge",
    icon: ArchiveBoxIcon,
    iconActive: ArchiveBoxIconSolid,
  },
  {
    name: "Przepisy",
    href: "/recipes",
    icon: BookOpenIcon,
    iconActive: BookOpenIconSolid,
  },
  {
    name: "Plan",
    href: "/meal-plan",
    icon: CalendarDaysIcon,
    iconActive: CalendarDaysIconSolid,
  },
];

interface NavigationBarProps {
  currentPath: string;
  isDemo?: boolean;
}

interface UserInfo {
  email: string;
  isDemo?: boolean;
}

const NavigationBarComponent: React.FC<NavigationBarProps> = ({ currentPath, isDemo = false }) => {
  // Demo banner height offset
  // Mobile (flex-col): ~100px, Tablet (sm+ flex-row): ~64px, Desktop (lg+ with extra info): ~88px
  const demoOffset = isDemo ? "top-[100px] sm:top-16 lg:top-[88px]" : "top-0";
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("fridgepick_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ email: parsed.email, isDemo: parsed.isDemo });
      } catch {
        // Invalid data
      }
    }
  }, []);

  const isActive = (href: string) => {
    if (href === "/fridge") {
      return currentPath === "/fridge" || currentPath.startsWith("/fridge/");
    }
    if (href === "/recipes") {
      return currentPath === "/recipes" || currentPath.startsWith("/recipes/");
    }
    if (href === "/meal-plan") {
      return currentPath === "/meal-plan" || currentPath.startsWith("/meal-plan/");
    }
    return currentPath === href;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Clear local storage
      localStorage.removeItem("fridgepick_access_token");
      localStorage.removeItem("fridgepick_user");
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Desktop Navigation - Top */}
      <nav className={`hidden md:flex fixed ${demoOffset} left-0 right-0 h-16 bg-white border-b border-gray-200 z-50`}>
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4">
          {/* Logo */}
          <a href="/fridge" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </a>

          {/* Center Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = active ? item.iconActive : item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
            >
              <UserCircleIcon className="w-6 h-6" />
              <span className="max-w-[150px] truncate">{user?.email || "Użytkownik"}</span>
              {user?.isDemo && <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Demo</span>}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop to close menu */}
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Zalogowany jako</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email || "Użytkownik"}</p>
                  </div>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCircleIcon className="w-4 h-4" />
                    Profil
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Wyloguj się
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header - Top */}
      <nav className={`md:hidden fixed ${demoOffset} left-0 right-0 h-14 bg-white border-b border-gray-200 z-50`}>
        <div className="flex items-center justify-between h-full px-4">
          {/* Logo */}
          <a href="/fridge" className="flex items-center">
            <Logo size="sm" />
          </a>

          {/* User Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
              aria-expanded={showUserMenu}
            >
              <UserCircleIcon className="w-6 h-6" />
              {user?.isDemo && <span className="px-1 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Demo</span>}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {/* Mobile Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Zalogowany jako</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email || "Użytkownik"}</p>
                  </div>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Profil
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Wyloguj się
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.iconActive : item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                  active ? "text-green-600" : "text-gray-500"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className={`text-xs mt-1 ${active ? "font-medium" : ""}`}>{item.name}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Spacer for fixed navigation (includes demo banner height when active) */}
      {/* Mobile: 100+56=156, Tablet: 64+64=128, Desktop: 88+64=152 */}
      <div className={isDemo ? "h-[156px] sm:h-[128px] md:h-[128px] lg:h-[152px]" : "h-14 md:h-16"} />
    </>
  );
};

NavigationBarComponent.displayName = "NavigationBar";
export const NavigationBar = React.memo(NavigationBarComponent);
