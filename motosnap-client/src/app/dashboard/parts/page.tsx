'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import DebugPanel from '@/components/DebugPanel';

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
}

export default function PartsPage() {
  const router = useRouter();
  const [parts, setParts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParts, setFilteredParts] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    let filtered = parts;

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(part =>
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== '') {
      filtered = filtered.filter(part => part.category === selectedCategory);
    }

    // Sort results
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.unitPrice - b.unitPrice;
        case 'price-high':
          return b.unitPrice - a.unitPrice;
        case 'stock':
          return b.qty - a.qty;
        case 'name':
        default:
          return a.partName.localeCompare(b.partName);
      }
    });

    setFilteredParts(filtered);
  }, [searchTerm, parts, selectedCategory, sortBy]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getParts();
      setParts(data);
      setFilteredParts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch parts');
      console.error('Error fetching parts:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (partId: number, quantity: number = 1) => {
    try {
      await apiClient.addToCart({
        inventoryId: partId,
        quantity: quantity
      });
      // TODO: Replace with toast notification
      alert('Item added to cart!');
    } catch (err) {
      alert('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    }
  };

  const getUniqueCategories = () => {
    const categories = parts
      .map(part => part.category)
      .filter(category => category && category.trim() !== '');
    return [...new Set(categories)].sort();
  };

  const getProductBadge = (part: InventoryItem) => {
    if (part.qty === 0) return { text: 'OUT OF STOCK', className: 'bg-red-100 text-red-800' };
    if (part.qty <= 5) return { text: 'LOW STOCK', className: 'bg-yellow-100 text-yellow-800' };
    if (part.unitPrice > 1000) return { text: 'PREMIUM', className: 'bg-purple-100 text-purple-800' };
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-text">Loading parts catalog...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={fetchParts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-primary hover:text-primary/80 mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="section-header">
            <h1 className="text-4xl font-bold text-text mb-2">Parts Catalog</h1>
            <p className="text-text-muted text-lg">Premium motorcycle parts and components for peak performance</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-2">Search Parts</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, part code, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
                />
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text"
              >
                <option value="">All Categories</option>
                {getUniqueCategories().map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-text mr-4 py-2">Sort by:</span>
            {[
              { value: 'name', label: 'Name' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'stock', label: 'Stock Level' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-text-muted hover:bg-muted/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-text-muted">
            Showing {filteredParts.length} of {parts.length} parts
            {selectedCategory && ` in "${selectedCategory}"`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredParts.map((part) => {
            const badge = getProductBadge(part);
            return (
              <div key={part.id} className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Product Image */}
                <div className="relative h-48 bg-muted/30">
                  {(part as any).imageUrl ? (
                    <img 
                      src={`http://localhost:8080${(part as any).imageUrl}`} 
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
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(part.id)}
                    disabled={part.qty === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      part.qty > 0
                        ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg active:scale-95'
                        : 'bg-muted text-text-muted cursor-not-allowed'
                    }`}
                  >
                    {part.qty > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredParts.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-sm mx-auto">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-semibold text-text mb-2">No parts found</h3>
              <p className="text-text-muted mb-4">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "No parts available in the catalog"
                }
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}