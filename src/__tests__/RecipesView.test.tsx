import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipesView } from "../components/recipes/RecipesView";
import * as useAuthModule from "../hooks/useAuth";

// Mock recipes response data
const mockRecipesResponse = {
  recipes: [
    {
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
    },
    {
      id: "recipe-2",
      name: "Grilled Salmon",
      description: "Healthy fish dish with herbs",
      mealCategory: "obiad",
      proteinType: "ryba",
      prepTimeMinutes: 25,
      servings: 2,
      nutritionalValues: { calories: 400, protein: 35, carbs: 5, fat: 25 },
      imageUrl: "https://example.com/salmon.jpg",
      createdAt: "2024-01-14T10:00:00Z",
    },
  ],
  pagination: {
    total: 2,
    limit: 20,
    offset: 0,
  },
};

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, "scrollTo", { value: mockScrollTo, writable: true });

// Mock heroicons
vi.mock("@heroicons/react/24/outline", () => ({
  ClockIcon: ({ className }: { className: string }) => <span data-testid="clock-icon" className={className} />,
  UserGroupIcon: ({ className }: { className: string }) => <span data-testid="user-group-icon" className={className} />,
  FireIcon: ({ className }: { className: string }) => <span data-testid="fire-icon" className={className} />,
  XMarkIcon: ({ className }: { className: string }) => <span data-testid="x-mark-icon" className={className} />,
  FunnelIcon: ({ className }: { className: string }) => <span data-testid="funnel-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }: { className: string }) => (
    <span data-testid="magnifying-glass-icon" className={className} />
  ),
  SparklesIcon: ({ className }: { className: string }) => <span data-testid="sparkles-icon" className={className} />,
  ChevronLeftIcon: ({ className }: { className: string }) => (
    <span data-testid="chevron-left-icon" className={className} />
  ),
  ChevronRightIcon: ({ className }: { className: string }) => (
    <span data-testid="chevron-right-icon" className={className} />
  ),
}));

// Mock getAccessToken
vi.mock("../hooks/useAuth", () => ({
  getAccessToken: vi.fn(),
}));

describe("RecipesView", () => {
  let mockFetch: Mock;
  let mockGetAccessToken: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";

    // Setup fetch mock
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRecipesResponse),
    });
    global.fetch = mockFetch;

    // Setup getAccessToken mock
    mockGetAccessToken = useAuthModule.getAccessToken as Mock;
    mockGetAccessToken.mockReturnValue("mock-jwt-token");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("should render the recipes header", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Przepisy")).toBeInTheDocument();
      });
    });

    it("should render the filters section", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Szukaj przepisów...")).toBeInTheDocument();
      });
    });

    it("should render recipes after loading", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
        expect(screen.getByText("Grilled Salmon")).toBeInTheDocument();
      });
    });

    it("should display recipe details correctly", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });

      // Check recipe card details are shown
      expect(screen.getByText("30 min")).toBeInTheDocument();
      expect(screen.getByText("550 kcal")).toBeInTheDocument();
      expect(screen.getByText("4 porcji")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should show error message when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Wystąpił błąd")).toBeInTheDocument();
        expect(screen.getByText("Błąd serwera: 500")).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spróbuj ponownie")).toBeInTheDocument();
      });
    });

    it("should retry fetch when retry button is clicked", async () => {
      const user = userEvent.setup();

      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spróbuj ponownie")).toBeInTheDocument();
      });

      // Setup successful response for retry
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecipesResponse),
      });

      await user.click(screen.getByText("Spróbuj ponownie"));

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });
    });
  });

  describe("recipe interaction", () => {
    it("should navigate to recipe detail when recipe card is clicked", async () => {
      const user = userEvent.setup();

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });

      // Click on the first recipe card
      const recipeCards = screen.getAllByRole("button");
      const spaghettiCard = recipeCards.find((card) => card.textContent?.includes("Spaghetti Carbonara"));
      expect(spaghettiCard).toBeTruthy();

      if (spaghettiCard) {
        await user.click(spaghettiCard);
        expect(mockLocation.href).toBe("/recipes/recipe-1");
      }
    });
  });

  describe("filtering", () => {
    it("should show all filter options", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByLabelText("Kategoria posiłku")).toBeInTheDocument();
        expect(screen.getByLabelText("Rodzaj białka")).toBeInTheDocument();
      });
    });

    it("should allow selecting a meal category", async () => {
      const user = userEvent.setup();

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByLabelText("Kategoria posiłku")).toBeInTheDocument();
      });

      const select = screen.getByLabelText("Kategoria posiłku");
      await user.selectOptions(select, "obiad");

      expect(select).toHaveValue("obiad");
    });

    it("should allow selecting a protein type", async () => {
      const user = userEvent.setup();

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByLabelText("Rodzaj białka")).toBeInTheDocument();
      });

      const select = screen.getByLabelText("Rodzaj białka");
      await user.selectOptions(select, "ryba");

      expect(select).toHaveValue("ryba");
    });
  });

  describe("empty state", () => {
    it("should show empty state when no recipes found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            recipes: [],
            pagination: { total: 0, limit: 20, offset: 0 },
          }),
      });

      render(<RecipesView />);

      await waitFor(() => {
        // Check for the empty state message
        expect(screen.getByText(/Brak przepisów/)).toBeInTheDocument();
      });
    });
  });

  describe("pagination", () => {
    it("should not show pagination when only one page", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });

      // With 2 recipes and limit 20, there's only 1 page
      // Pagination previous/next buttons should not be visible
      expect(screen.queryByLabelText("Poprzednia strona")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Następna strona")).not.toBeInTheDocument();
    });

    it("should show pagination when multiple pages", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            recipes: mockRecipesResponse.recipes,
            pagination: { total: 45, limit: 20, offset: 0 },
          }),
      });

      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });

      // With 45 items and limit 20, there are 3 pages
      // Pagination should be visible with next button
      await waitFor(() => {
        expect(screen.getByLabelText("Następna strona")).toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("should have accessible recipe cards", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      });

      // Recipe cards should be focusable buttons
      const recipeCards = screen.getAllByRole("button");
      expect(recipeCards.length).toBeGreaterThan(0);
    });

    it("should have focusable filter controls", async () => {
      render(<RecipesView />);

      await waitFor(() => {
        expect(screen.getByLabelText("Kategoria posiłku")).toBeInTheDocument();
      });

      const mealCategorySelect = screen.getByLabelText("Kategoria posiłku");
      const proteinTypeSelect = screen.getByLabelText("Rodzaj białka");

      expect(mealCategorySelect).not.toBeDisabled();
      expect(proteinTypeSelect).not.toBeDisabled();
    });
  });
});
