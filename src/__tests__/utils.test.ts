import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("utils", () => {
  describe("cn() - classnames utility", () => {
    it("should merge single class name", () => {
      // Arrange
      const className = "text-red-500";

      // Act
      const result = cn(className);

      // Assert
      expect(result).toBe("text-red-500");
    });

    it("should merge multiple class names", () => {
      // Arrange
      const classes = ["text-red-500", "font-bold", "p-4"];

      // Act
      const result = cn(...classes);

      // Assert
      expect(result).toBe("text-red-500 font-bold p-4");
    });

    it("should handle conditional classes with falsy values", () => {
      // Arrange
      const condition = false;

      // Act
      const result = cn("base-class", condition && "conditional-class", "always-included");

      // Assert
      expect(result).toBe("base-class always-included");
    });

    it("should handle conditional classes with truthy values", () => {
      // Arrange
      const condition = true;

      // Act
      const result = cn("base-class", condition && "conditional-class", "always-included");

      // Assert
      expect(result).toBe("base-class conditional-class always-included");
    });

    it("should merge conflicting Tailwind classes correctly", () => {
      // Arrange - twMerge should keep the last conflicting class

      // Act
      const result = cn("p-4", "p-8");

      // Assert
      expect(result).toBe("p-8"); // p-8 overrides p-4
    });

    it("should handle objects with conditional classes", () => {
      // Arrange
      const isActive = true;
      const isDisabled = false;

      // Act
      const result = cn({
        "base-class": true,
        active: isActive,
        disabled: isDisabled,
      });

      // Assert
      expect(result).toBe("base-class active");
    });

    it("should handle arrays of classes", () => {
      // Arrange
      const baseClasses = ["text-sm", "font-medium"];
      const additionalClasses = ["text-blue-500", "hover:text-blue-700"];

      // Act
      const result = cn(baseClasses, additionalClasses);

      // Assert
      expect(result).toBe("text-sm font-medium text-blue-500 hover:text-blue-700");
    });

    it("should handle null and undefined values gracefully", () => {
      // Arrange & Act
      const result = cn("base-class", null, undefined, "end-class");

      // Assert
      expect(result).toBe("base-class end-class");
    });

    it("should handle empty strings", () => {
      // Arrange & Act
      const result = cn("base-class", "", "end-class");

      // Assert
      expect(result).toBe("base-class end-class");
    });

    it("should handle complex real-world button example", () => {
      // Arrange
      const variant = "primary";
      const size = "md";
      const disabled = false;

      // Act
      const result = cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
        },
        {
          "px-3 py-2 text-sm": size === "sm",
          "px-4 py-2 text-base": size === "md",
          "px-6 py-3 text-lg": size === "lg",
        },
        {
          "opacity-50 cursor-not-allowed": disabled,
        }
      );

      // Assert
      expect(result).toContain("inline-flex");
      expect(result).toContain("bg-blue-600");
      expect(result).toContain("px-4 py-2 text-base");
      expect(result).not.toContain("opacity-50");
    });

    it("should deduplicate identical classes", () => {
      // Arrange & Act
      const result = cn("text-red-500", "font-bold", "text-red-500");

      // Assert
      expect(result).toBe("font-bold text-red-500");
    });

    it("should handle responsive Tailwind classes", () => {
      // Arrange & Act
      const result = cn("w-full", "md:w-1/2", "lg:w-1/3");

      // Assert
      expect(result).toBe("w-full md:w-1/2 lg:w-1/3");
    });

    it("should merge hover and focus states correctly", () => {
      // Arrange & Act
      const result = cn("text-blue-500", "hover:text-blue-700", "focus:ring-2");

      // Assert
      expect(result).toBe("text-blue-500 hover:text-blue-700 focus:ring-2");
    });
  });

  // Future utility functions can be added here when implemented
  describe("date utilities (future)", () => {
    it("should be implemented when date formatting is extracted to utils", () => {
      // Placeholder for future date utility tests
      expect(true).toBe(true);
    });
  });

  describe("number formatting utilities (future)", () => {
    it("should be implemented when number formatting is extracted to utils", () => {
      // Placeholder for future number utility tests
      expect(true).toBe(true);
    });
  });
});
