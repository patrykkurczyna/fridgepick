import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeCard } from "../components/recipes/RecipeCard";
import type { RecipeDTO } from "@/types";

// Mock heroicons
vi.mock("@heroicons/react/24/outline", () => ({
  ClockIcon: ({ className }: { className: string }) => <span data-testid="clock-icon" className={className} />,
  UserGroupIcon: ({ className }: { className: string }) => <span data-testid="user-group-icon" className={className} />,
  FireIcon: ({ className }: { className: string }) => <span data-testid="fire-icon" className={className} />,
}));

describe("RecipeCard", () => {
  const mockRecipe: RecipeDTO = {
    id: "recipe-1",
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta with eggs and bacon",
    mealCategory: "obiad",
    proteinType: "czerwone mięso",
    prepTimeMinutes: 30,
    servings: 4,
    nutritionalValues: { calories: 550, protein: 25, carbs: 60, fat: 20 },
    imageUrl: "https://example.com/spaghetti.jpg",
    createdAt: "2024-01-15T10:00:00Z",
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render recipe name", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
    });

    it("should render recipe description", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Classic Italian pasta with eggs and bacon")).toBeInTheDocument();
    });

    it("should render prep time", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("30 min")).toBeInTheDocument();
    });

    it("should render servings", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("4 porcji")).toBeInTheDocument();
    });

    it("should render calories when available", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("550 kcal")).toBeInTheDocument();
    });

    it("should not render calories when not available", () => {
      const recipeWithoutCalories: RecipeDTO = {
        ...mockRecipe,
        nutritionalValues: null,
      };

      render(<RecipeCard recipe={recipeWithoutCalories} onClick={mockOnClick} />);

      expect(screen.queryByText(/kcal/)).not.toBeInTheDocument();
    });

    it("should render meal category badge", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Obiad")).toBeInTheDocument();
    });

    it("should render protein type badge", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Czerwone mięso")).toBeInTheDocument();
    });

    it("should render image with correct alt text", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("alt", "Spaghetti Carbonara");
      expect(image).toHaveAttribute("src", "https://example.com/spaghetti.jpg");
    });

    it("should use placeholder when image URL is null", () => {
      const recipeWithoutImage: RecipeDTO = {
        ...mockRecipe,
        imageUrl: null,
      };

      render(<RecipeCard recipe={recipeWithoutImage} onClick={mockOnClick} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "/images/recipe-placeholder.svg");
    });

    it("should not render description when not provided", () => {
      const recipeWithoutDescription: RecipeDTO = {
        ...mockRecipe,
        description: null,
      };

      render(<RecipeCard recipe={recipeWithoutDescription} onClick={mockOnClick} />);

      expect(screen.queryByText("Classic Italian pasta with eggs and bacon")).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should call onClick with recipe id when clicked", async () => {
      const user = userEvent.setup();

      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const card = screen.getByRole("button");
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith("recipe-1");
    });

    it("should call onClick when Enter key is pressed", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith("recipe-1");
    });

    it("should call onClick when Space key is pressed", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: " " });

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith("recipe-1");
    });

    it("should not call onClick for other keys", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: "Tab" });

      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have role button", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be focusable", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("image error handling", () => {
    it("should use placeholder when image fails to load", () => {
      render(<RecipeCard recipe={mockRecipe} onClick={mockOnClick} />);

      const image = screen.getByRole("img");
      expect(image).toHaveAttribute("src", "https://example.com/spaghetti.jpg");

      // Simulate image load error
      fireEvent.error(image);

      expect(image).toHaveAttribute("src", "/images/recipe-placeholder.svg");
    });
  });

  describe("different recipe types", () => {
    it("should render breakfast category correctly", () => {
      const breakfastRecipe: RecipeDTO = {
        ...mockRecipe,
        mealCategory: "śniadanie",
      };

      render(<RecipeCard recipe={breakfastRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Śniadanie")).toBeInTheDocument();
    });

    it("should render vege protein type correctly", () => {
      const vegeRecipe: RecipeDTO = {
        ...mockRecipe,
        proteinType: "vege",
      };

      render(<RecipeCard recipe={vegeRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Vege")).toBeInTheDocument();
    });

    it("should render fish protein type correctly", () => {
      const fishRecipe: RecipeDTO = {
        ...mockRecipe,
        proteinType: "ryba",
      };

      render(<RecipeCard recipe={fishRecipe} onClick={mockOnClick} />);

      expect(screen.getByText("Ryba")).toBeInTheDocument();
    });
  });
});
