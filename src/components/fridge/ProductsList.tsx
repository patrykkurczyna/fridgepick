import React from "react";
import { ProductCard } from "./ProductCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import type { ProductDTO } from "@/types/fridge";

interface ProductsListProps {
  products: ProductDTO[];
  loading: boolean;
  isSearching?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Lista/grid produktów z responsive layout
 * Obsługuje loading states, empty states i mapowanie ProductCard components
 */
export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  loading,
  isSearching = false,
  onEdit,
  onDelete,
}) => {
  // Loading state - only show skeleton on initial load, not during search
  if (loading) {
    return (
      <div className="products-grid grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <LoadingSkeleton count={8} variant="card" />
      </div>
    );
  }

  // Empty state
  if (!loading && products.length === 0) {
    return (
      <EmptyState
        onAddFirst={() => {
          // Navigation to add product will be handled by parent
          window.location.href = "/fridge/add";
        }}
        variant="empty"
      />
    );
  }

  return (
    <div
      className={`
        products-grid grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
        transition-opacity duration-200
        ${isSearching ? "opacity-60" : "opacity-100"}
      `}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};
