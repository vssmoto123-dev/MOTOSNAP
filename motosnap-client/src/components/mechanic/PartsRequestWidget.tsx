'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { VariationDefinition, SelectedVariations } from '@/types/variations';

interface PartsRequest {
  id: number;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED' | 'CANCELLED';
  reason: string;
  requestedAt: string;
  
  // Part information
  partId: number;
  partName: string;
  partCategory: string;
  partPrice: number;
  availableStock: number;
  
  // Mechanic information
  mechanicId: number;
  mechanicName: string;
  
  // Booking information
  bookingId: number;
  serviceName: string;
  customerName: string;
  vehiclePlateNo: string;
  
  // Variation information
  selectedVariations?: SelectedVariations;
  selectedVariationsDisplay?: string;
}

interface InventoryItem {
  id: number;
  partName: string;
  partCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  minStockLevel: number;
  category?: string;
  brand?: string;
  active: boolean;
  deleted: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lowStock: boolean;
  // Variation support
  variations?: string | VariationDefinition[] | {hasVariations: boolean, options: VariationDefinition[]};
  variationStock?: string | {allocations: Record<string, number>, unallocated: number};
}

interface PartsRequestWidgetProps {
  bookingId: number;
}


export const PartsRequestWidget: React.FC<PartsRequestWidgetProps> = ({ bookingId }) => {
  const [requests, setRequests] = useState<PartsRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Variation support
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariations>({});
  const [variationDefinitions, setVariationDefinitions] = useState<VariationDefinition[]>([]);
  const [showVariations, setShowVariations] = useState(false);

  // Helper function to parse variation data from inventory item (same logic as admin page)
  const parseVariationData = (item: InventoryItem): { hasVariations: boolean; variations: VariationDefinition[] } => {
    let variations: VariationDefinition[] = [];
    let hasVariations = false;
    
    try {
      if (item.variations) {
        if (typeof item.variations === 'string') {
          const parsed = JSON.parse(item.variations);
          // Handle the backend format: {hasVariations: true, options: [...]}
          if (parsed && typeof parsed === 'object') {
            if (parsed.options && Array.isArray(parsed.options)) {
              variations = parsed.options;
              hasVariations = parsed.hasVariations === true;
            } else if (Array.isArray(parsed)) {
              variations = parsed;
              hasVariations = variations.length > 0;
            }
          }
        } else if (Array.isArray(item.variations)) {
          variations = item.variations;
          hasVariations = variations.length > 0;
        } else if (typeof item.variations === 'object' && item.variations !== null) {
          // Handle object format from backend
          const variationsObj = item.variations as any;
          if (variationsObj.options && Array.isArray(variationsObj.options)) {
            variations = variationsObj.options;
            hasVariations = variationsObj.hasVariations === true;
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse variation data:', error);
      variations = [];
      hasVariations = false;
    }
    
    return { hasVariations, variations };
  };

  // Helper function to get variation display text for an item
  const getVariationDisplayText = (item: InventoryItem): string => {
    const { hasVariations, variations } = parseVariationData(item);
    if (hasVariations && variations.length > 0) {
      return ` (${variations.length} variation${variations.length > 1 ? 's' : ''})`;
    }
    return '';
  };

  // Handle part selection change
  const handlePartSelection = (partId: string) => {
    setSelectedPartId(partId);
    setSelectedVariations({});
    
    if (partId) {
      const selectedPart = inventory.find(part => part.id.toString() === partId);
      if (selectedPart) {
        const { hasVariations, variations } = parseVariationData(selectedPart);
        setVariationDefinitions(variations);
        setShowVariations(hasVariations);
        
        if (!hasVariations) {
          setSelectedVariations({});
        }
      }
    } else {
      setVariationDefinitions([]);
      setShowVariations(false);
      setSelectedVariations({});
    }
  };

  // Load parts requests and inventory on component mount
  useEffect(() => {
    fetchPartsRequests();
    fetchInventory();
  }, [bookingId]);

  const fetchPartsRequests = async () => {
    try {
      setLoadingRequests(true);
      const data = await apiClient.getPartsRequestsForBooking(bookingId);
      setRequests(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch parts requests:', err);
      // Don't show error for empty results, just log it
      if (err?.message !== 'Not Found') {
        setError('Failed to load parts requests');
      }
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const data = await apiClient.getParts();
      // Filter for parts with stock > 0
      const availableParts = data.filter(item => item.qty > 0);
      setInventory(availableParts);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      if (err?.status === 403) {
        setError('Access denied - please check if you are logged in as a mechanic');
      } else if (err?.status === 401) {
        setError('Authentication required - please log in again');
      } else {
        setError(`Failed to load parts inventory: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddRequest = async () => {
    if (!selectedPartId) {
      setError('Please select a part');
      return;
    }

    if (quantity < 1 || quantity > 10) {
      setError('Quantity must be between 1 and 10');
      return;
    }

    const selectedPart = inventory.find(part => part.id.toString() === selectedPartId);
    if (!selectedPart) {
      setError('Selected part not found');
      return;
    }

    // Validation for variations
    if (showVariations && variationDefinitions.length > 0) {
      // Check if all required variations are selected
      const requiredVariations = variationDefinitions.filter(v => v.required);
      const missingRequired = requiredVariations.filter(v => 
        !selectedVariations[v.id] || !selectedVariations[v.id].trim()
      );
      
      if (missingRequired.length > 0) {
        setError(`Please select required variations: ${missingRequired.map(v => v.name).join(', ')}`);
        return;
      }

      // For varied products, we'll use a simplified stock check for now
      // In a full implementation, this would check variation-specific stock
      if (quantity > selectedPart.qty) {
        setError(`Not enough total stock for this variation. Available: ${selectedPart.qty}`);
        return;
      }
    } else {
      // For non-varied products, check regular stock
      if (quantity > selectedPart.qty) {
        setError(`Not enough stock. Available: ${selectedPart.qty}`);
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      // Build variation display string
      let variationDisplayString = '';
      if (showVariations && Object.keys(selectedVariations).length > 0) {
        variationDisplayString = Object.entries(selectedVariations)
          .filter(([_, value]) => value)
          .map(([varId, value]) => {
            const variation = variationDefinitions.find(v => v.id === varId);
            return `${variation?.name || varId}: ${value}`;
          })
          .join(', ');
      }

      await apiClient.createPartsRequest(bookingId, {
        partId: selectedPart.id,
        quantity: quantity,
        reason: `Requested ${selectedPart.partName}${variationDisplayString ? ` (${variationDisplayString})` : ''} for booking #${bookingId}`,
        selectedVariations: Object.keys(selectedVariations).length > 0 ? selectedVariations : undefined,
      });

      // Refresh the requests list
      await fetchPartsRequests();
      
      // Reset form
      setSelectedPartId('');
      setQuantity(1);
      setSelectedVariations({});
      setVariationDefinitions([]);
      setShowVariations(false);
      
      setSuccess(`${selectedPart.partName}${variationDisplayString ? ` (${variationDisplayString})` : ''} x${quantity} requested successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to submit parts request:', err);
      setError(err?.error || 'Failed to submit parts request');
    } finally {
      setLoading(false);
    }
  };

  const handleUseRequest = async (requestId: number) => {
    // For Phase 3, we'll just update the local state
    // In a future phase, this could call an API to mark parts as used
    setRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'USED' as const }
          : req
      )
    );
    setSuccess('Parts marked as used!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const getStatusDisplay = (status: PartsRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-yellow-600">⏳ Waiting approval</span>;
      case 'APPROVED':
        return <span className="text-green-600">✅ Approved</span>;
      case 'REJECTED':
        return <span className="text-red-600">❌ Rejected</span>;
      case 'USED':
        return <span className="text-blue-600">🔧 Used</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium text-gray-900 mb-3">🔧 Need Workshop Parts?</h4>
      
      {/* Success Message */}
      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-800 rounded text-sm">
          {success}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Request Form */}
      <div className="flex gap-2 mb-4">
        <select
          value={selectedPartId}
          onChange={(e) => handlePartSelection(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
          disabled={loading || loadingInventory}
        >
          <option value="">
            {loadingInventory ? 'Loading parts...' : 'Select part...'}
          </option>
          {inventory.map((part) => (
            <option key={part.id} value={part.id.toString()}>
              {part.partName}{getVariationDisplayText(part)} - ${part.unitPrice.toFixed(2)} (Stock: {part.qty})
            </option>
          ))}
        </select>
        
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          min="1"
          max="10"
          className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
          disabled={loading}
        />
        
        <Button
          onClick={handleAddRequest}
          disabled={loading || !selectedPartId}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? '...' : '+ Add'}
        </Button>
      </div>
      
      {/* Variation Selection UI */}
      {showVariations && variationDefinitions.length > 0 && (
        <div className="mb-4 p-3 border border-blue-200 rounded-md bg-blue-50">
          <h5 className="font-medium text-blue-900 text-sm mb-3">Select Variations:</h5>
          <div className="space-y-3">
            {variationDefinitions.map((variation) => (
              <div key={variation.id} className="space-y-1">
                <label className="block text-sm font-medium text-blue-800">
                  {variation.name}
                  {variation.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {variation.type === 'dropdown' && (
                  <select
                    value={selectedVariations[variation.id] || ''}
                    onChange={(e) => setSelectedVariations(prev => ({
                      ...prev,
                      [variation.id]: e.target.value
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <option value="">Select {variation.name.toLowerCase()}...</option>
                    {variation.values.filter(val => val.trim()).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                )}
                
                {variation.type === 'radio' && (
                  <div className="space-y-1">
                    {variation.values.filter(val => val.trim()).map((value) => (
                      <label key={value} className="flex items-center space-x-2 text-sm">
                        <input
                          type="radio"
                          name={`variation_${variation.id}`}
                          value={value}
                          checked={selectedVariations[variation.id] === value}
                          onChange={(e) => setSelectedVariations(prev => ({
                            ...prev,
                            [variation.id]: e.target.value
                          }))}
                          className="text-blue-600"
                          disabled={loading}
                        />
                        <span className="text-gray-700">{value}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Show current selection */}
          {Object.keys(selectedVariations).length > 0 && (
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
              <strong className="text-blue-900">Selected:</strong>{' '}
              <span className="text-blue-800">
                {Object.entries(selectedVariations)
                  .filter(([_, value]) => value)
                  .map(([varId, value]) => {
                    const variation = variationDefinitions.find(v => v.id === varId);
                    return `${variation?.name || varId}: ${value}`;
                  })
                  .join(', ')
                }
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Requests List */}
      {requests.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium text-gray-700 text-sm">Current Requests:</h5>
          {requests.map((request) => (
            <div key={request.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
              <div className="flex-1">
                <span className="font-medium text-black">• {request.partName}</span>
                <span className="text-gray-600"> x{request.quantity}</span>
                <span className="text-gray-500 text-xs"> (${request.partPrice?.toFixed(2)})</span>
                {/* Display variation information if available */}
                {request.selectedVariationsDisplay && (
                  <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <span>📋</span>
                    <span>{request.selectedVariationsDisplay}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getStatusDisplay(request.status)}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loadingRequests && requests.length === 0 && (
        <p className="text-sm text-gray-500 italic">No parts requested yet</p>
      )}

      {loadingRequests && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading requests...</span>
        </div>
      )}
    </div>
  );
};