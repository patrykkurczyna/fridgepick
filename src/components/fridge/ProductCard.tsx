import React from 'react';
import { PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { calculateExpiryStatus, calculateDaysUntilExpiry } from '@/types/fridge';
import type { ProductDTO, ExpiryStatus } from '@/types/fridge';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface ProductCardProps {
  product: ProductDTO;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  variant?: 'default' | 'compact';
}

/**
 * Karta pojedynczego produktu z informacjami i akcjami
 * Pokazuje: nazwę, kategorię, ilość, datę ważności z visual indicators
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  variant = 'default'
}) => {
  // Kalkulacja expiry status
  const daysUntilExpiry = product.daysUntilExpiry ?? calculateDaysUntilExpiry(product.expiresAt);
  const expiryStatus = calculateExpiryStatus(daysUntilExpiry);

  /**
   * Get expiry display text and styling
   */
  const getExpiryInfo = () => {
    if (!product.expiresAt) {
      return {
        text: 'Brak daty ważności',
        className: 'text-gray-500',
        bgClassName: 'bg-gray-100'
      };
    }

    const date = format(new Date(product.expiresAt), 'dd MMM yyyy', { locale: pl });

    switch (expiryStatus) {
      case 'expired':
        return {
          text: `Wygasł ${Math.abs(daysUntilExpiry!)} dni temu`,
          className: 'text-red-700 font-medium',
          bgClassName: 'bg-red-50 border-red-200'
        };
      case 'warning':
        return {
          text: `Wygasa ${daysUntilExpiry === 0 ? 'dziś' : `za ${daysUntilExpiry} dni`}`,
          className: 'text-orange-700 font-medium',
          bgClassName: 'bg-orange-50 border-orange-200'
        };
      case 'fresh':
        return {
          text: `Ważny do ${date}`,
          className: 'text-green-700',
          bgClassName: 'bg-green-50 border-green-200'
        };
      default:
        return {
          text: `Ważny do ${date}`,
          className: 'text-gray-600',
          bgClassName: 'bg-gray-50 border-gray-200'
        };
    }
  };

  const expiryInfo = getExpiryInfo();

  /**
   * Handle card click (edit action)
   */
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click when clicking action buttons
    if ((e.target as HTMLElement).closest('.action-button')) {
      return;
    }
    onEdit(product.id);
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product.id);
  };

  /**
   * Handle edit action
   */
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product.id);
  };

  const isCompact = variant === 'compact';

  return (
    <div
      onClick={handleCardClick}
      className={`
        product-card
        ${expiryInfo.bgClassName}
        border rounded-lg p-4 cursor-pointer
        hover:shadow-md transition-all duration-200
        ${isCompact ? 'p-3' : 'p-4'}
      `}
    >
      {/* Header z nazwą i akcjami */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-gray-900 truncate ${isCompact ? 'text-sm' : 'text-base'}`}>
            {product.name}
          </h3>
          <p className={`text-gray-600 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {product.categoryName}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={handleEdit}
            className="action-button p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
            aria-label="Edytuj produkt"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="action-button p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            aria-label="Usuń produkt"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ilość i jednostka */}
      <div className="flex items-center justify-between mb-2">
        <div className={`text-gray-700 font-medium ${isCompact ? 'text-sm' : 'text-base'}`}>
          {product.quantity} {product.unit}
        </div>

        {/* Expiry warning icon dla expired/warning */}
        {(expiryStatus === 'expired' || expiryStatus === 'warning') && (
          <ExclamationTriangleIcon 
            className={`w-5 h-5 ${expiryStatus === 'expired' ? 'text-red-500' : 'text-orange-500'}`} 
          />
        )}
      </div>

      {/* Data ważności */}
      <div className={`${expiryInfo.className} ${isCompact ? 'text-xs' : 'text-sm'}`}>
        {expiryInfo.text}
      </div>

      {/* Dodana data (tylko w default variant) */}
      {!isCompact && (
        <div className="mt-2 text-xs text-gray-400">
          Dodano {format(new Date(product.createdAt), 'dd MMM yyyy', { locale: pl })}
        </div>
      )}
    </div>
  );
};