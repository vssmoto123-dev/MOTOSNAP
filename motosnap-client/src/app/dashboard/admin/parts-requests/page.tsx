'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { apiClient } from '@/lib/api';

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
        
        setSuccess(`Approved ${request?.partName} x${request?.quantity} for ${request?.mechanicName}`);
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
        
        setSuccess(`Rejected ${request?.partName} x${request?.quantity} for ${request?.mechanicName}`);
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Today</p>
              <p className="text-2xl font-bold text-green-600">{approvedToday.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                ${pendingRequests.reduce((sum, req) => sum + (req.partPrice * req.quantity), 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mechanic & Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request) => {
                    const stockStatus = getStockStatus(request);
                    return (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.partName}</div>
                            <div className="text-sm text-gray-500">Quantity: {request.quantity}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.mechanicName}</div>
                            <div className="text-sm text-gray-500">Booking #{request.bookingId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">${(request.partPrice * request.quantity).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">{getTimeAgo(request.requestedAt)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleApproveRequest(request.id)}
                              disabled={processingId === request.id}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingId === request.id ? '...' : '✓ Approve'}
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={processingId === request.id}
                              size="sm"
                              variant="secondary"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              {processingId === request.id ? '...' : '✗ Reject'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {pendingRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md mb-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
          <p className="mt-1 text-sm text-gray-500">All parts requests have been processed.</p>
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
                      {request.partName} x{request.quantity} → {request.mechanicName}
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