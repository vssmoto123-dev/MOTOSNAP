'use client';

import React, { useState, useEffect } from 'react';
import { VariationDefinition, SelectedVariations } from '@/types/variations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
// Removed Select import - using native select element instead
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// Using simple HTML icons instead of lucide-react
import { Checkbox } from '@/components/ui/checkbox';

interface VariationBuilderProps {
  initialVariations?: VariationDefinition[];
  onChange: (variations: VariationDefinition[]) => void;
  disabled?: boolean;
  validationErrors?: {[key: string]: string};
}

export function VariationBuilder({ 
  initialVariations = [], 
  onChange, 
  disabled = false,
  validationErrors = {}
}: VariationBuilderProps) {
  // Ensure initialVariations is always an array
  const safeInitialVariations = Array.isArray(initialVariations) ? initialVariations : [];
  const [variations, setVariations] = useState<VariationDefinition[]>(safeInitialVariations);

  useEffect(() => {
    const safeVariations = Array.isArray(initialVariations) ? initialVariations : [];
    setVariations(safeVariations);
  }, [initialVariations]);

  const handleVariationChange = (updatedVariations: VariationDefinition[]) => {
    setVariations(updatedVariations);
    // Use setTimeout to avoid synchronous state updates
    setTimeout(() => onChange(updatedVariations), 0);
  };

  const addVariation = () => {
    const newVariation: VariationDefinition = {
      id: `var_${Date.now()}`,
      name: '',
      type: 'dropdown',
      values: [''],
      required: true
    };
    
    const updated = [...variations, newVariation];
    handleVariationChange(updated);
  };

  const removeVariation = (index: number) => {
    const updated = variations.filter((_, i) => i !== index);
    handleVariationChange(updated);
  };

  const updateVariation = (index: number, field: keyof VariationDefinition, value: any) => {
    const updated = variations.map((variation, i) => 
      i === index ? { ...variation, [field]: value } : variation
    );
    handleVariationChange(updated);
  };

  const addVariationValue = (variationIndex: number) => {
    const updated = variations.map((variation, i) => 
      i === variationIndex 
        ? { ...variation, values: [...variation.values, ''] }
        : variation
    );
    handleVariationChange(updated);
  };

  const removeVariationValue = (variationIndex: number, valueIndex: number) => {
    const updated = variations.map((variation, i) => 
      i === variationIndex 
        ? { ...variation, values: variation.values.filter((_, vi) => vi !== valueIndex) }
        : variation
    );
    handleVariationChange(updated);
  };

  const updateVariationValue = (variationIndex: number, valueIndex: number, value: string) => {
    const updated = variations.map((variation, i) => 
      i === variationIndex 
        ? { 
            ...variation, 
            values: variation.values.map((v, vi) => vi === valueIndex ? value : v)
          }
        : variation
    );
    handleVariationChange(updated);
  };

  // Generate all possible variation combinations for preview
  const generateVariationCombinations = (): SelectedVariations[] => {
    // Ensure variations is an array and has valid data
    if (!Array.isArray(variations) || variations.length === 0 || variations.some(v => !v.values || v.values.length === 0)) {
      return [];
    }

    const validVariations = variations.filter(v => v.name.trim() && v.values.some(val => val.trim()));
    if (validVariations.length === 0) return [];

    const combinations: SelectedVariations[] = [];
    
    const generateCombos = (index: number, current: SelectedVariations) => {
      if (index >= validVariations.length) {
        combinations.push({ ...current });
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

  const combinations = generateVariationCombinations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Variations</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariation}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Variation
        </Button>
      </div>

      {variations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>No variations defined. Click "Add Variation" to start.</p>
              <p className="text-sm mt-2">
                Variations allow customers to select specific options like size, color, or model.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {variations.map((variation, variationIndex) => (
            <Card key={variation.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⋮⋮</span>
                  <CardTitle className="text-base text-black">
                    Variation {variationIndex + 1}
                  </CardTitle>
                  <Badge variant={variation.required ? "default" : "secondary"}>
                    {variation.required ? "Required" : "Optional"}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariation(variationIndex)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <span className="text-lg">🗑</span>
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Variation Name & Type */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 text-black">
                    <Label htmlFor={`variation-name-${variationIndex}`}>
                      Variation Name *
                    </Label>
                    <Input
                      id={`variation-name-${variationIndex}`}
                      placeholder="e.g., Size, Color, Model"
                      value={variation.name}
                      onChange={(e) => updateVariation(variationIndex, 'name', e.target.value)}
                      disabled={disabled}
                      required
                      className={validationErrors[`variation_${variationIndex}_name`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {validationErrors[`variation_${variationIndex}_name`] && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{validationErrors[`variation_${variationIndex}_name`]}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-black">
                    <Label htmlFor={`variation-type-${variationIndex}`}>
                      Display Type
                    </Label>
                    <select
                      value={variation.type}
                      onChange={(e) => updateVariation(variationIndex, 'type', e.target.value)}
                      disabled={disabled}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="dropdown">Dropdown</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkboxes</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-black">
                    <Label>Options</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`variation-required-${variationIndex}`}
                        checked={variation.required}
                        onCheckedChange={(checked) => 
                          updateVariation(variationIndex, 'required', checked)
                        }
                        disabled={disabled}
                      />
                      <Label 
                        htmlFor={`variation-required-${variationIndex}`}
                        className="text-sm font-normal"
                      >
                        Required selection
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Variation Values */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-black">Variation Values *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addVariationValue(variationIndex)}
                      disabled={disabled}
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className="text-sm">+</span>
                      Add Value
                    </Button>
                  </div>
                  
                  {validationErrors[`variation_${variationIndex}_values`] && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {validationErrors[`variation_${variationIndex}_values`]}
                    </div>
                  )}
                  
                  <div className="grid gap-2">
                    {variation.values.map((value, valueIndex) => (
                      <div key={valueIndex} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${valueIndex + 1} (e.g., Small, Red, Model A)`}
                            value={value}
                            onChange={(e) => 
                              updateVariationValue(variationIndex, valueIndex, e.target.value)
                            }
                            disabled={disabled}
                            required
                            className={validationErrors[`variation_${variationIndex}_value_${valueIndex}`] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                          />
                          {validationErrors[`variation_${variationIndex}_value_${valueIndex}`] && (
                            <p className="mt-1 text-xs text-red-600 font-medium">{validationErrors[`variation_${variationIndex}_value_${valueIndex}`]}</p>
                          )}
                        </div>
                        {variation.values.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariationValue(variationIndex, valueIndex)}
                            disabled={disabled}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                          >
                            <span className="text-sm">×</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview of Variation Combinations */}
      {combinations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Preview - Possible Combinations ({combinations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {combinations.slice(0, 20).map((combo, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {Object.entries(combo)
                    .map(([key, value]) => {
                      const variation = variations.find(v => v.id === key);
                      return `${variation?.name || key}: ${value}`;
                    })
                    .join(', ')
                  }
                </Badge>
              ))}
              {combinations.length > 20 && (
                <Badge variant="secondary" className="text-xs">
                  +{combinations.length - 20} more...
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}