'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { apiClient } from '@/lib/api';
import { SelectedVariations } from '@/types/variations';

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

export default function AdminPartsRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<PartsRequest[]>([]);
  const [allRequests, setAllRequests] = useState<PartsRequest[]>([]); // Track all requests including processed ones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    // Redirect non-admins
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      fetchPartsRequests();
    }
  }, [user, router]);

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  const fetchPartsRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getPendingPartsRequests();
      setRequests(data);
      
      // Load processed requests from localStorage
      const stored = localStorage.getItem('processedRequests');
      const storedRequests: PartsRequest[] = stored ? JSON.parse(stored) : [];
      
      // Keep existing processed requests and add new pending ones
      setAllRequests(prev => {
        const existingIds = prev.map(r => r.id);
        const storedIds = storedRequests.map(r => r.id);
        const newRequests = data.filter(r => !existingIds.includes(r.id));
        const newStoredRequests = storedRequests.filter(r => !existingIds.includes(r.id));
        return [...prev, ...newRequests, ...newStoredRequests];
      });
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch parts requests:', err);
      setError(err?.error || 'Failed to load parts requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await apiClient.approvePartsRequest(requestId, {
        adminNotes: 'Approved by admin'
      });
      
      const request = requests.find(r => r.id === requestId);
      if (request) {
        // Update the request status in allRequests
        const updatedRequest = { ...request, status: 'APPROVED' as const };
        setAllRequests(prev => {
          const updated = prev.map(r => r.id === requestId ? updatedRequest : r);
          // Save processed requests to localStorage
          const processed = updated.filter(r => r.status !== 'PENDING');
          localStorage.setItem('processedRequests', JSON.stringify(processed));
          return updated;
        });
        
        const variationText = request?.selectedVariationsDisplay ? ` (${request.selectedVariationsDisplay})` : '';
        setSuccess(`Approved ${request?.partName}${variationText} x${request?.quantity} for ${request?.mechanicName}`);
      }
      
      // Refresh the requests list
      await fetchPartsRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      setError(err?.error || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await apiClient.rejectPartsRequest(requestId, {
        adminNotes: 'Rejected by admin'
      });
      
      const request = requests.find(r => r.id === requestId);
      if (request) {
        // Update the request status in allRequests  
        const updatedRequest = { ...request, status: 'REJECTED' as const };
        setAllRequests(prev => {
          const updated = prev.map(r => r.id === requestId ? updatedRequest : r);
          // Save processed requests to localStorage
          const processed = updated.filter(r => r.status !== 'PENDING');
          localStorage.setItem('processedRequests', JSON.stringify(processed));
          return updated;
        });
        
        const variationText = request?.selectedVariationsDisplay ? ` (${request.selectedVariationsDisplay})` : '';
        setSuccess(`Rejected ${request?.partName}${variationText} x${request?.quantity} for ${request?.mechanicName}`);
      }
      
      // Refresh the requests list
      await fetchPartsRequests();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      setError(err?.error || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getTimeAgo = (dateTimeString: string) => {
    const now = new Date();
    const requestTime = new Date(dateTimeString);
    const diffMs = now.getTime() - requestTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    }
    return `${diffMinutes}m ago`;
  };

  const getStatusColor = (status: PartsRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockStatus = (request: PartsRequest) => {
    // For now, we'll assume stock is available since we don't have inventory integration yet
    // In a future phase, this could call an API to check current inventory levels
    const estimated = request.quantity;
    return { text: `Available`, color: 'text-green-600' };
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = allRequests.filter(r => r.status !== 'PENDING');
  const approvedToday = allRequests.filter(r => r.status === 'APPROVED' && isToday(r.requestedAt));

  

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading parts requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Parts Request Management</h1>
        <p className="text-gray-600 mt-2">Review and approve mechanic parts requests</p>
      </div>

      {/* Status Messages */}
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

      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md mb-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1 text-sm text-gray-500">All parts requests have been processed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(request.requestedAt)}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {request.partName}
                        {request.selectedVariationsDisplay && (
                          <span className="text-sm text-gray-600 ml-2">({request.selectedVariationsDisplay})</span>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Quantity:</span> {request.quantity}</p>
                          <p><span className="font-medium">Category:</span> {request.partCategory}</p>
                          <p><span className="font-medium">Price:</span> MYR {request.partPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Mechanic:</span> {request.mechanicName}</p>
                          <p><span className="font-medium">Customer:</span> {request.customerName}</p>
                          <p><span className="font-medium">Vehicle:</span> {request.vehiclePlateNo}</p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {request.reason}</p>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm">
                          <span className={`font-medium ${getStockStatus(request).color}`}>
                            {getStockStatus(request).text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(request.requestedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={processingId === request.id}
                        variant="primary"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {processingId === request.id ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processingId === request.id}
                        variant="destructive"
                        size="sm"
                      >
                        {processingId === request.id ? 'Processing...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {processedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="space-y-4">
              {processedRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-sm text-gray-900">
                      {request.partName}
                      {request.selectedVariationsDisplay && ` (${request.selectedVariationsDisplay})`}
                      {` x${request.quantity} → ${request.mechanicName}`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTimeAgo(request.requestedAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Back */}
      <div className="mt-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}