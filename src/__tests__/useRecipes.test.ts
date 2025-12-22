import { describe, it, expect, beforeEach, vi, afterEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRecipes } from "../hooks/useRecipes";
import * as useAuthModule from "../hooks/useAuth";

// Mock recipes response data
const mockRecipesResponse = {
  recipes: [
    {
      id: "recipe-1",
      name: "Spaghetti Bolognese",
      description: "Classic Italian pasta dish",
      mealCategory: "obiad",
      proteinType: "czerwone mięso",
      prepTimeMinutes: 45,
      servings: 4,
      nutritionalValues: { calories: 550, protein: 25, carbs: 60, fat: 20 },
      imageUrl: "https://example.com/spaghetti.jpg",
      createdAt: "2024-01-15T10:00:00Z",
    },
    {
      id: "recipe-2",
      name: "Grilled Salmon",
      description: "Healthy fish dish",
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

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, "scrollTo", { value: mockScrollTo, writable: true });

// Mock getAccessToken
vi.mock("../hooks/useAuth", () => ({
  getAccessToken: vi.fn(),
}));

describe("useRecipes", () => {
  let mockFetch: Mock;
  let mockGetAccessToken: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

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

  describe("initial state", () => {
    it("should have correct initial loading state", async () => {
      const { result } = renderHook(() => useRecipes());

      // Check initial state before async updates
      expect(result.current.loading).toBe(true);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.recipes).toEqual([]);

      // Wait for fetch to complete to avoid act warnings
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should have empty filter state initially", async () => {
      const { result } = renderHook(() => useRecipes());

      expect(result.current.filters).toEqual({
        searchQuery: "",
        mealCategory: null,
        proteinType: null,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it("should have correct initial pagination", async () => {
      const { result } = renderHook(() => useRecipes());

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.limit).toBe(20);
      expect(result.current.pagination.offset).toBe(0);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("fetching recipes", () => {
    it("should fetch recipes on mount", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith("/api/recipes?limit=20&offset=0", {
        headers: {
          Authorization: "Bearer mock-jwt-token",
          "Content-Type": "application/json",
        },
      });

      expect(result.current.recipes).toHaveLength(2);
    });

    it("should update recipes after successful fetch", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recipes).toEqual(mockRecipesResponse.recipes);
      expect(result.current.pagination.total).toBe(2);
    });

    it("should handle fetch error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Błąd serwera: 500");
    });

    it("should handle 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Sesja wygasła. Zaloguj się ponownie.");
    });

    it("should handle 429 rate limit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Zbyt wiele zapytań. Spróbuj ponownie za chwilę.");
    });

    it("should not fetch when no access token", async () => {
      mockGetAccessToken.mockReturnValue(null);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.recipes).toEqual([]);
    });
  });

  describe("filter handlers", () => {
    it("should update search query immediately", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleSearch("pasta");
      });

      expect(result.current.filters.searchQuery).toBe("pasta");
    });

    it("should update meal category filter", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleMealCategoryChange("obiad");
      });

      expect(result.current.filters.mealCategory).toBe("obiad");
    });

    it("should update protein type filter", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleProteinTypeChange("ryba");
      });

      expect(result.current.filters.proteinType).toBe("ryba");
    });

    it("should clear meal category filter when set to null", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleMealCategoryChange("obiad");
      });

      expect(result.current.filters.mealCategory).toBe("obiad");

      act(() => {
        result.current.handleMealCategoryChange(null);
      });

      expect(result.current.filters.mealCategory).toBeNull();
    });

    it("should reset filters correctly", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set some filters
      act(() => {
        result.current.handleSearch("test");
        result.current.handleMealCategoryChange("obiad");
        result.current.handleProteinTypeChange("ryba");
      });

      expect(result.current.filters.searchQuery).toBe("test");
      expect(result.current.filters.mealCategory).toBe("obiad");
      expect(result.current.filters.proteinType).toBe("ryba");

      // Reset filters
      act(() => {
        result.current.handleResetFilters();
      });

      expect(result.current.filters).toEqual({
        searchQuery: "",
        mealCategory: null,
        proteinType: null,
      });
    });
  });

  describe("pagination", () => {
    it("should update current page", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(result.current.pagination.currentPage).toBe(2);
    });

    it("should call scrollTo on page change", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handlePageChange(2);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("should calculate correct offset for pagination", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handlePageChange(3);
      });

      // offset = (page - 1) * itemsPerPage = (3-1) * 20 = 40
      expect(result.current.pagination.offset).toBe(40);
    });

    it("should calculate total pages correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            recipes: [],
            pagination: { total: 45, limit: 20, offset: 0 },
          }),
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pagination.totalPages).toBe(3); // ceil(45/20) = 3
    });

    it("should have minimum of 1 total page", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            recipes: [],
            pagination: { total: 0, limit: 20, offset: 0 },
          }),
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.pagination.totalPages).toBe(1);
    });
  });

  describe("computed values", () => {
    it("should compute activeFiltersCount correctly with no filters", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.activeFiltersCount).toBe(0);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should compute activeFiltersCount correctly with filters", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleMealCategoryChange("obiad");
      });

      expect(result.current.activeFiltersCount).toBe(1);
      expect(result.current.hasActiveFilters).toBe(true);

      act(() => {
        result.current.handleProteinTypeChange("ryba");
      });

      expect(result.current.activeFiltersCount).toBe(2);
    });

    it("should include search in active filters count when >= 2 chars", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleSearch("pa");
      });

      expect(result.current.activeFiltersCount).toBe(1);
    });

    it("should not include search in active filters count when < 2 chars", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleSearch("p");
      });

      expect(result.current.activeFiltersCount).toBe(0);
    });
  });

  describe("retry and refresh", () => {
    it("should set loading state when retry is called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();

      // Reset mock for successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRecipesResponse),
      });

      act(() => {
        result.current.retry();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.recipes).toHaveLength(2);
    });

    it("should refresh data when refresh is called", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = mockFetch.mock.calls.length;

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe("URL building", () => {
    it("should include limit and offset in URL", async () => {
      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("limit=20"), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("offset=0"), expect.any(Object));
    });
  });
});
