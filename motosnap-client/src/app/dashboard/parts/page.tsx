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

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredParts(parts);
    } else {
      const filtered = parts.filter(part =>
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParts(filtered);
    }
  }, [searchTerm, parts]);

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

  const addToCart = async (partId: number) => {
    try {
      await apiClient.addToCart({
        inventoryId: partId,
        quantity: 1
      });
      alert('Item added to cart!');
    } catch (err) {
      alert('Failed to add item to cart');
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading parts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold">Parts Catalog</h1>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParts.map((part) => (
          <div key={part.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image Section */}
            {(part as any).imageUrl && (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={`http://localhost:8080${(part as any).imageUrl}`} 
                  alt={part.partName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-black">{part.partName}</h3>
            <p className="text-gray-600 mb-2">Part #: {part.partCode}</p>
            {part.description && (
              <p className="text-gray-700 mb-4">{part.description}</p>
            )}
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-green-600">
                ${typeof part.unitPrice === 'number' ? part.unitPrice.toFixed(2) : '0.00'}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                part.qty > 0 
                  ? part.qty > 10 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {part.qty > 0 ? `${part.qty} in stock` : 'Out of stock'}
              </span>
            </div>
            <button
              onClick={() => addToCart(part.id)}
              disabled={part.qty === 0}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                part.qty > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {part.qty > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            </div>
          </div>
        ))}
      </div>

      {filteredParts.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No parts found matching your search.</p>
        </div>
      )}
    </div>
  );
}