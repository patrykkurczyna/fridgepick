import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipesFilters } from "../components/recipes/RecipesFilters";
import type { RecipesFiltersState } from "@/types/recipes";

// Mock heroicons
vi.mock("@heroicons/react/24/outline", () => ({
  XMarkIcon: ({ className }: { className: string }) => <span data-testid="x-mark-icon" className={className} />,
  FunnelIcon: ({ className }: { className: string }) => <span data-testid="funnel-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }: { className: string }) => (
    <span data-testid="magnifying-glass-icon" className={className} />
  ),
}));

describe("RecipesFilters", () => {
  const defaultFilters: RecipesFiltersState = {
    searchQuery: "",
    mealCategory: null,
    proteinType: null,
  };

  const mockOnSearchChange = vi.fn();
  const mockOnMealCategoryChange = vi.fn();
  const mockOnProteinTypeChange = vi.fn();
  const mockOnResetFilters = vi.fn();

  const defaultProps = {
    filters: defaultFilters,
    onSearchChange: mockOnSearchChange,
    onMealCategoryChange: mockOnMealCategoryChange,
    onProteinTypeChange: mockOnProteinTypeChange,
    onResetFilters: mockOnResetFilters,
    loading: false,
    activeFiltersCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render search input", () => {
      render(<RecipesFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText("Szukaj przepisów...")).toBeInTheDocument();
    });

    it("should render meal category filter with default option", () => {
      render(<RecipesFilters {...defaultProps} />);

      // The select for meal category should show "Wszystkie" as default
      const mealCategorySelect = screen.getByLabelText("Kategoria posiłku");
      expect(mealCategorySelect).toBeInTheDocument();
      expect(mealCategorySelect).toHaveValue("");
    });

    it("should render protein type filter with default option", () => {
      render(<RecipesFilters {...defaultProps} />);

      // The select for protein type should show "Wszystkie" as default
      const proteinTypeSelect = screen.getByLabelText("Rodzaj białka");
      expect(proteinTypeSelect).toBeInTheDocument();
      expect(proteinTypeSelect).toHaveValue("");
    });

    it("should not render reset button when no active filters", () => {
      render(<RecipesFilters {...defaultProps} />);

      expect(screen.queryByLabelText("Wyczyść wszystkie filtry")).not.toBeInTheDocument();
    });

    it("should render reset button when filters are active", () => {
      render(<RecipesFilters {...defaultProps} activeFiltersCount={2} />);

      expect(screen.getByLabelText("Wyczyść wszystkie filtry")).toBeInTheDocument();
    });

    it("should show active filters count on reset button", () => {
      render(<RecipesFilters {...defaultProps} activeFiltersCount={2} />);

      // There are two "2" elements - one on the reset button badge and one in the indicator
      expect(screen.getAllByText("2")).toHaveLength(2);
    });

    it("should show active filters indicator", () => {
      render(<RecipesFilters {...defaultProps} activeFiltersCount={3} />);

      expect(screen.getByText("Aktywne filtry:")).toBeInTheDocument();
      // There are two "3" elements - one on the reset button badge and one in the indicator
      expect(screen.getAllByText("3")).toHaveLength(2);
    });

    it("should not show active filters indicator when no filters", () => {
      render(<RecipesFilters {...defaultProps} activeFiltersCount={0} />);

      expect(screen.queryByText("Aktywne filtry:")).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    it("should call onSearchChange when typing in search", async () => {
      const user = userEvent.setup();

      render(<RecipesFilters {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("Szukaj przepisów...");
      await user.type(searchInput, "pasta");

      expect(mockOnSearchChange).toHaveBeenCalled();
    });

    it("should call onResetFilters when reset button is clicked", async () => {
      const user = userEvent.setup();

      render(<RecipesFilters {...defaultProps} activeFiltersCount={1} />);

      const resetButton = screen.getByLabelText("Wyczyść wszystkie filtry");
      await user.click(resetButton);

      expect(mockOnResetFilters).toHaveBeenCalledTimes(1);
    });

    it("should call onMealCategoryChange when meal category is selected", async () => {
      const user = userEvent.setup();

      render(<RecipesFilters {...defaultProps} />);

      const select = screen.getByLabelText("Kategoria posiłku");
      await user.selectOptions(select, "obiad");

      expect(mockOnMealCategoryChange).toHaveBeenCalledWith("obiad");
    });

    it("should call onMealCategoryChange with null when selecting all", async () => {
      const user = userEvent.setup();

      const filtersWithCategory: RecipesFiltersState = {
        ...defaultFilters,
        mealCategory: "obiad",
      };

      render(<RecipesFilters {...defaultProps} filters={filtersWithCategory} />);

      const select = screen.getByLabelText("Kategoria posiłku");
      await user.selectOptions(select, "");

      expect(mockOnMealCategoryChange).toHaveBeenCalledWith(null);
    });

    it("should call onProteinTypeChange when protein type is selected", async () => {
      const user = userEvent.setup();

      render(<RecipesFilters {...defaultProps} />);

      const select = screen.getByLabelText("Rodzaj białka");
      await user.selectOptions(select, "ryba");

      expect(mockOnProteinTypeChange).toHaveBeenCalledWith("ryba");
    });

    it("should call onProteinTypeChange with null when selecting all", async () => {
      const user = userEvent.setup();

      const filtersWithProtein: RecipesFiltersState = {
        ...defaultFilters,
        proteinType: "ryba",
      };

      render(<RecipesFilters {...defaultProps} filters={filtersWithProtein} />);

      const select = screen.getByLabelText("Rodzaj białka");
      await user.selectOptions(select, "");

      expect(mockOnProteinTypeChange).toHaveBeenCalledWith(null);
    });
  });

  describe("disabled state", () => {
    it("should NOT disable search input when loading (to preserve focus)", () => {
      render(<RecipesFilters {...defaultProps} loading={true} />);

      // Search input should NOT be disabled during loading to preserve focus
      const searchInput = screen.getByPlaceholderText("Szukaj przepisów...");
      expect(searchInput).not.toBeDisabled();
    });

    it("should disable meal category filter when loading", () => {
      render(<RecipesFilters {...defaultProps} loading={true} />);

      const select = screen.getByLabelText("Kategoria posiłku");
      expect(select).toBeDisabled();
    });

    it("should disable protein type filter when loading", () => {
      render(<RecipesFilters {...defaultProps} loading={true} />);

      const select = screen.getByLabelText("Rodzaj białka");
      expect(select).toBeDisabled();
    });

    it("should disable reset button when loading", () => {
      render(<RecipesFilters {...defaultProps} loading={true} activeFiltersCount={1} />);

      const resetButton = screen.getByLabelText("Wyczyść wszystkie filtry");
      expect(resetButton).toBeDisabled();
    });
  });

  describe("filter values display", () => {
    it("should display current search query value", () => {
      const filtersWithSearch: RecipesFiltersState = {
        ...defaultFilters,
        searchQuery: "spaghetti",
      };

      render(<RecipesFilters {...defaultProps} filters={filtersWithSearch} />);

      const searchInput = screen.getByPlaceholderText("Szukaj przepisów...");
      expect(searchInput).toHaveValue("spaghetti");
    });

    it("should display current meal category value", () => {
      const filtersWithCategory: RecipesFiltersState = {
        ...defaultFilters,
        mealCategory: "śniadanie",
      };

      render(<RecipesFilters {...defaultProps} filters={filtersWithCategory} />);

      const select = screen.getByLabelText("Kategoria posiłku");
      expect(select).toHaveValue("śniadanie");
    });

    it("should display current protein type value", () => {
      const filtersWithProtein: RecipesFiltersState = {
        ...defaultFilters,
        proteinType: "drób",
      };

      render(<RecipesFilters {...defaultProps} filters={filtersWithProtein} />);

      const select = screen.getByLabelText("Rodzaj białka");
      expect(select).toHaveValue("drób");
    });
  });

  describe("meal category options", () => {
    it("should have all meal category options", () => {
      render(<RecipesFilters {...defaultProps} />);

      const select = screen.getByLabelText("Kategoria posiłku");

      // Check for each option
      expect(select).toContainHTML("Wszystkie");
      expect(select).toContainHTML("Śniadanie");
      expect(select).toContainHTML("Obiad");
      expect(select).toContainHTML("Kolacja");
      expect(select).toContainHTML("Przekąska");
    });
  });

  describe("protein type options", () => {
    it("should have all protein type options", () => {
      render(<RecipesFilters {...defaultProps} />);

      const select = screen.getByLabelText("Rodzaj białka");

      // Check for each option
      expect(select).toContainHTML("Wszystkie");
      expect(select).toContainHTML("Ryba");
      expect(select).toContainHTML("Drób");
      expect(select).toContainHTML("Czerwone mięso");
      expect(select).toContainHTML("Vege");
    });
  });
});
