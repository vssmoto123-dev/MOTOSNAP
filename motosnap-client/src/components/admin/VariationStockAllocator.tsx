'use client';

import React, { useState, useEffect } from 'react';
import { VariationDefinition, SelectedVariations } from '@/types/variations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Using simple HTML icons instead of lucide-react
import { Alert, AlertDescription } from '@/components/ui/alert-new';
import apiClient from '@/lib/api';

interface VariationStockAllocatorProps {
  variations: VariationDefinition[];
  totalStock: number;
  initialStockAllocations?: Record<string, number>;
  onChange: (allocations: Record<string, number>) => void;
  disabled?: boolean;
}

export function VariationStockAllocator({ 
  variations, 
  totalStock, 
  initialStockAllocations = {},
  onChange, 
  disabled = false 
}: VariationStockAllocatorProps) {
  const [allocations, setAllocations] = useState<Record<string, number>>(initialStockAllocations);
  const [unallocated, setUnallocated] = useState(totalStock);
  
  // Generate all possible variation combinations
  const generateCombinations = (): { key: string; display: string; variations: SelectedVariations }[] => {
    // Ensure variations is an array and has valid data
    if (!Array.isArray(variations) || variations.length === 0 || variations.some(v => !v.values || v.values.length === 0)) {
      return [];
    }

    const validVariations = variations.filter(v => v.name.trim() && v.values.some(val => val.trim()));
    if (validVariations.length === 0) return [];

    const combinations: { key: string; display: string; variations: SelectedVariations }[] = [];
    
    const generateCombos = (index: number, current: SelectedVariations) => {
      if (index >= validVariations.length) {
        const key = apiClient.buildVariationKey(current);
        const display = Object.entries(current)
          .map(([varId, value]) => {
            const variation = validVariations.find(v => v.id === varId);
            return `${variation?.name || varId}: ${value}`;
          })
          .join(', ');
        
        combinations.push({ key, display, variations: current });
        return;
      }

      const variation = validVariations[index];
      const validValues = variation.values.filter(v => v.trim());
      
      for (const value of validValues) {
        generateCombos(index + 1, { ...current, [variation.id]: value });
      }
    };

    generateCombos(0, {});
    return combinations;
  };

  const combinations = generateCombinations();

  // Update unallocated stock when allocations change
  useEffect(() => {
    const totalAllocated = Object.values(allocations).reduce((sum, qty) => sum + (qty || 0), 0);
    setUnallocated(Math.max(0, totalStock - totalAllocated));
  }, [allocations, totalStock]);

  // Update parent component when allocations change
  useEffect(() => {
    onChange(allocations);
  }, [allocations]); // Remove onChange from dependencies to avoid infinite loop

  const updateAllocation = (variationKey: string, quantity: number) => {
    const numQuantity = Math.max(0, quantity);
    
    setAllocations(prev => ({
      ...prev,
      [variationKey]: numQuantity
    }));
  };

  const autoAllocateEvenly = () => {
    if (combinations.length === 0) return;
    
    const perCombination = Math.floor(totalStock / combinations.length);
    const remainder = totalStock % combinations.length;
    
    const newAllocations: Record<string, number> = {};
    combinations.forEach((combo, index) => {
      newAllocations[combo.key] = perCombination + (index < remainder ? 1 : 0);
    });
    
    setAllocations(newAllocations);
  };

  const clearAllocations = () => {
    setAllocations({});
  };

  const totalAllocated = Object.values(allocations).reduce((sum, qty) => sum + (qty || 0), 0);
  const isOverAllocated = totalAllocated > totalStock;

  if (combinations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2 opacity-50">📦</div>
            <p>Define variations first to allocate stock</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-black">
              <span className="text-lg">📦</span>
              Stock Allocation
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={autoAllocateEvenly}
                disabled={disabled || combinations.length === 0}
                className="flex items-center gap-1"
              >
                <span className="text-sm">🔄</span>
                Auto Allocate
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllocations}
                disabled={disabled}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stock Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{totalStock}</div>
              <div className="text-sm text-gray-600">Total Stock</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOverAllocated ? 'text-red-600' : 'text-blue-600'}`}>
                {totalAllocated}
              </div>
              <div className="text-sm text-gray-600">Allocated</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${unallocated < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {unallocated}
              </div>
              <div className="text-sm text-gray-600">Unallocated</div>
            </div>
          </div>

          {/* Over-allocation Warning */}
          {isOverAllocated && (
            <Alert variant="destructive">
              <span className="text-red-600">⚠️</span>
              <AlertDescription>
                Total allocated stock ({totalAllocated}) exceeds available stock ({totalStock}).
                Please adjust allocations.
              </AlertDescription>
            </Alert>
          )}

          {/* Individual Variation Allocations */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Stock per Variation ({combinations.length} combinations)
            </Label>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {combinations.map((combo) => {
                const currentAllocation = allocations[combo.key] || 0;
                
                return (
                  <div key={combo.key} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Badge variant="outline" className="text-xs">
                        {combo.display}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={totalStock}
                        value={currentAllocation}
                        onChange={(e) => updateAllocation(combo.key, parseInt(e.target.value) || 0)}
                        disabled={disabled}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500 min-w-[40px]">units</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unallocated Stock Notice */}
          {unallocated > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <span className="text-sm">📦</span>
                <span className="text-sm font-medium">
                  {unallocated} units remain unallocated
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Unallocated stock can be used for any variation when customers place orders.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}