'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getImageBaseUrl } from '@/lib/api';

interface InventoryItem {
  id: number;
  partName: string;
  partCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  category?: string;
  brand?: string;
  active: boolean;
  imageUrl?: string;
}

interface PartsGridProps {
  parts: InventoryItem[];
  title?: string;
  showTitle?: boolean;
  maxItems?: number;
}

export default function PartsGrid({
  parts,
  title = "Related Products",
  showTitle = true,
  maxItems
}: PartsGridProps) {
  const router = useRouter();

  const displayParts = maxItems ? parts.slice(0, maxItems) : parts;

  const getProductBadge = (part: InventoryItem) => {
    if (part.qty === 0) return { text: 'OUT OF STOCK', className: 'bg-red-100 text-red-800' };
    if (part.qty <= 5) return { text: 'LOW STOCK', className: 'bg-yellow-100 text-yellow-800' };
    if (part.unitPrice > 1000) return { text: 'PREMIUM', className: 'bg-purple-100 text-purple-800' };
    return null;
  };

  const handlePartClick = (partId: number) => {
    router.push(`/dashboard/part-detail?id=${partId}`);
  };

  if (displayParts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">{title}</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded"></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayParts.map((part) => {
          const badge = getProductBadge(part);
          return (
            <div
              key={part.id}
              className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
              onClick={() => handlePartClick(part.id)}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-muted/30">
                {part.imageUrl ? (
                  <img
                    src={`${getImageBaseUrl()}${part.imageUrl}`}
                    alt={part.partName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-text opacity-20">
                      {part.partName.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                )}

                {/* Product Badge */}
                {badge && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                    {badge.text}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                {/* Brand */}
                {part.brand && (
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                    {part.brand}
                  </div>
                )}

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {part.partName}
                </h3>

                {/* Click indicator */}
                <div className="flex items-center text-primary text-sm font-medium mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Details</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Part Code */}
                <p className="text-text-muted text-sm mb-2">Part #: {part.partCode}</p>

                {/* Description */}
                {part.description && (
                  <p className="text-text-muted text-sm mb-4 line-clamp-2">{part.description}</p>
                )}

                {/* Price and Stock */}
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-text">
                    ${typeof part.unitPrice === 'number' ? part.unitPrice.toFixed(2) : '0.00'}
                  </div>
                  <div className={`text-sm font-medium ${
                    part.qty > 0
                      ? part.qty > 10
                        ? 'text-green-600'
                        : 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {part.qty > 0 ? `${part.qty} in stock` : 'Out of stock'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}