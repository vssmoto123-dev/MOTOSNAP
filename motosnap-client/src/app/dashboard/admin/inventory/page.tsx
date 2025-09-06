'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient, { getImageBaseUrl } from '@/lib/api';
import { InventoryItem, InventoryRequest } from '@/types/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface InventoryFormData extends InventoryRequest {
  id?: number;
  imageFile?: File | null;
  imagePreview?: string;
}

export default function InventoryManagement() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    partName: '',
    partCode: '',
    description: '',
    qty: 0,
    unitPrice: 0,
    minStockLevel: 0,
    category: '',
    brand: '',
    imageFile: null,
    imagePreview: '',
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const fetchInventory = async () => {
    try {
      setError(null);
      const items = await apiClient.getInventory();
      setInventory(items);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchInventory();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const items = await apiClient.searchInventory(searchTerm);
      setInventory(items);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Part Name validation
    if (!formData.partName.trim()) {
      errors.partName = 'Part name is required';
    } else if (formData.partName.trim().length < 2) {
      errors.partName = 'Part name must be at least 2 characters';
    } else if (formData.partName.trim().length > 100) {
      errors.partName = 'Part name cannot exceed 100 characters';
    }

    // Part Code validation
    if (!formData.partCode.trim()) {
      errors.partCode = 'Part code is required';
    } else if (formData.partCode.trim().length < 2) {
      errors.partCode = 'Part code must be at least 2 characters';
    } else if (formData.partCode.trim().length > 50) {
      errors.partCode = 'Part code cannot exceed 50 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    // Quantity validation
    if (formData.qty < 0) {
      errors.qty = 'Quantity cannot be negative';
    }

    // Unit Price validation
    if (!formData.unitPrice || formData.unitPrice <= 0) {
      errors.unitPrice = 'Unit price must be greater than 0';
    }

    // Min Stock Level validation
    if (formData.minStockLevel < 0) {
      errors.minStockLevel = 'Minimum stock level cannot be negative';
    }

    // Category validation
    if (formData.category && formData.category.length > 50) {
      errors.category = 'Category cannot exceed 50 characters';
    }

    // Brand validation
    if (formData.brand && formData.brand.length > 50) {
      errors.brand = 'Brand cannot exceed 50 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if a new file is selected
      if (formData.imageFile) {
        const uploadResponse = await apiClient.uploadInventoryImage(formData.imageFile);
        imageUrl = uploadResponse.imageUrl;
      }
      
      // Prepare form data with image URL
      const submitData: InventoryRequest = {
        partName: formData.partName,
        partCode: formData.partCode,
        description: formData.description,
        qty: formData.qty,
        unitPrice: formData.unitPrice,
        minStockLevel: formData.minStockLevel,
        category: formData.category,
        brand: formData.brand,
        imageUrl: imageUrl,
      };

      if (editingItem) {
        await apiClient.updateInventoryItem(editingItem.id, submitData);
        setSuccess('Item updated successfully');
      } else {
        await apiClient.createInventoryItem(submitData);
        setSuccess('Item created successfully');
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchInventory();
    } catch (err: unknown) {
      console.error('Submit failed:', err);
      const errorMsg = err && typeof err === 'object' && 'error' in err ? (err as {error: string}).error : 'Failed to save item';
      setError(errorMsg);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      partName: item.partName,
      partCode: item.partCode,
      description: item.description || '',
      qty: item.qty,
      unitPrice: item.unitPrice,
      minStockLevel: item.minStockLevel,
      category: item.category || '',
      brand: item.brand || '',
      imageUrl: item.imageUrl,
      imageFile: null,
      imagePreview: item.imageUrl ? `http://localhost:8080${item.imageUrl}` : undefined,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      setError(null);
      await apiClient.deleteInventoryItem(id);
      setSuccess('Item deleted successfully');
      fetchInventory();
    } catch (err: unknown) {
      console.error('Delete failed:', err);
      const errorMsg = err && typeof err === 'object' && 'error' in err ? (err as {error: string}).error : 'Failed to delete item';
      setError(errorMsg);
    }
  };

  const resetForm = () => {
    setFormData({
      partName: '',
      partCode: '',
      description: '',
      qty: 0,
      unitPrice: 0,
      minStockLevel: 0,
      category: '',
      brand: '',
      imageUrl: undefined,
      imageFile: null,
      imagePreview: undefined,
    });
    setValidationErrors({});
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
    resetForm();
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData({ 
        ...formData, 
        imageFile: file, 
        imagePreview: previewUrl 
      });
      setError(null);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchInventory();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage motorcycle parts and track stock levels.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Add Item
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name, code, category, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
        <Button onClick={() => { setSearchTerm(''); fetchInventory(); }} variant="secondary">
          Clear
        </Button>
      </div>

      {/* Enhanced Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Two-Column Layout: Image Upload + Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Image Upload Section */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Image</h4>
                      <div className="space-y-4">
                        <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-100">
                          {formData.imagePreview ? (
                            <img 
                              src={formData.imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="mt-2 text-sm text-gray-600">Upload product image</p>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500">
                          Upload JPEG, PNG, GIF, or WebP. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Information Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Input
                              label="Part Name"
                              type="text"
                              required
                              value={formData.partName}
                              onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                            />
                            {validationErrors.partName && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.partName}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              label="Part Code"
                              type="text"
                              required
                              value={formData.partCode}
                              onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                            />
                            {validationErrors.partCode && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.partCode}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              label="Category"
                              type="text"
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                            {validationErrors.category && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                            )}
                          </div>
                          <div>
                            <Input
                              label="Brand"
                              type="text"
                              value={formData.brand}
                              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            />
                            {validationErrors.brand && (
                              <p className="mt-1 text-sm text-red-600">{validationErrors.brand}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Stock & Pricing Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock & Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input
                        label="Quantity"
                        type="number"
                        required
                        min="0"
                        value={formData.qty}
                        onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                      />
                      {validationErrors.qty && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.qty}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Unit Price"
                        type="number"
                        step="0.01"
                        required
                        min="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                      {validationErrors.unitPrice && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.unitPrice}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        label="Min Stock Level"
                        type="number"
                        required
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                      />
                      {validationErrors.minStockLevel && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.minStockLevel}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Description</h4>
                  <div>
                    <textarea
                      placeholder="Enter detailed product description..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-black"
                    />
                    {validationErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button type="button" onClick={cancelForm} variant="secondary" className="px-6 py-2">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2">
                    {editingItem ? 'Update Item' : 'Create Item'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {item.imageUrl && (
                          <img 
                            src={`${getImageBaseUrl()}${item.imageUrl}`} 
                            alt={item.partName}
                            className="h-10 w-10 object-cover rounded-md"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.partName}</div>
                          <div className="text-sm text-gray-500">{item.partCode}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category || '-'}</div>
                      <div className="text-sm text-gray-500">{item.brand || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.qty}</div>
                      <div className="text-sm text-gray-500">Min: {item.minStockLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.lowStock 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.lowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventory.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No inventory items found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}