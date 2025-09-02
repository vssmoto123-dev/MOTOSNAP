'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { BookingResponse, BookingStatus, BookingStatusUpdateRequest } from '@/types/booking';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function MechanicBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Notes modal state
  const [updatingBooking, setUpdatingBooking] = useState<BookingResponse | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    // Redirect non-mechanics
    if (user && user.role !== 'MECHANIC') {
      router.push('/dashboard');
      return;
    }
    
    if (user) {
      fetchBookings();
    }
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Use getAllBookings (which mechanics have access to) instead of getUserBookings
      const data = await apiClient.getAllBookings(); 
      // Filter to only show bookings assigned to this mechanic
      const mechanicBookings = data.filter(booking => booking.assignedMechanicId === user?.id);
      setBookings(mechanicBookings);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: BookingStatus, notes?: string) => {
    try {
      const updateRequest: BookingStatusUpdateRequest = {
        status: newStatus,
        statusNotes: notes
      };
      
      await apiClient.updateBookingStatus(bookingId, updateRequest);
      setSuccess(`Booking status updated to ${newStatus}`);
      setUpdatingBooking(null);
      setStatusNotes('');
      fetchBookings();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      setError(err?.error || 'Failed to update booking status');
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getNextStatusAction = (currentStatus: BookingStatus) => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return { status: 'IN_PROGRESS' as BookingStatus, label: 'Start Service', color: 'bg-purple-600 hover:bg-purple-700' };
      case 'IN_PROGRESS':
        return { status: 'COMPLETED' as BookingStatus, label: 'Complete Service', color: 'bg-green-600 hover:bg-green-700' };
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    return !statusFilter || booking.status === statusFilter;
  });

  const activeBookings = filteredBookings.filter(b => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = filteredBookings.filter(b => b.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-2">Manage your assigned service bookings</p>
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
              <p className="text-sm font-medium text-gray-600">Total Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-purple-600">{activeBookings.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedBookings.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          >
            <option value="">All Bookings</option>
            <option value="CONFIRMED">Ready to Start</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <Button
            onClick={fetchBookings}
            variant="outline"
            size="sm"
            className='text-black'
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter ? `No bookings with ${statusFilter.toLowerCase().replace('_', ' ')} status.` : 'You haven\'t been assigned any service bookings yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{booking.serviceName}</h3>
                  <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  {getNextStatusAction(booking.status) && (
                    <Button
                      onClick={() => {
                        const action = getNextStatusAction(booking.status);
                        if (action) {
                          if (action.status === 'COMPLETED') {
                            setUpdatingBooking(booking);
                          } else {
                            handleStatusUpdate(booking.id, action.status);
                          }
                        }
                      }}
                      className={`${getNextStatusAction(booking.status)?.color} text-white`}
                      size="sm"
                    >
                      {getNextStatusAction(booking.status)?.label}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer & Vehicle</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="text-gray-900 font-medium">{booking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-gray-900">{booking.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="text-gray-900">{booking.vehiclePlateNo} - {booking.vehicleBrand} {booking.vehicleModel}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="text-gray-900">{formatDateTime(booking.scheduledDateTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-gray-900">${booking.serviceBasePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900">{Math.floor(booking.serviceEstimatedDurationMinutes / 60)}h {booking.serviceEstimatedDurationMinutes % 60}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{booking.notes}</p>
                </div>
              )}

              {/* Progress Timeline */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Progress Timeline</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${booking.createdAt ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Booked</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Confirmed</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${['IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">In Progress</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${booking.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="ml-2 text-xs text-gray-600">Completed</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                <div>
                  <span className="block font-medium">Assigned</span>
                  <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
                {booking.startedAt && (
                  <div>
                    <span className="block font-medium">Started</span>
                    <span>{new Date(booking.startedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {booking.completedAt && (
                  <div>
                    <span className="block font-medium">Completed</span>
                    <span>{new Date(booking.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Service Completion Modal */}
      {updatingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Complete Service - Booking #{updatingBooking.id}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Service: {updatingBooking.serviceName} for {updatingBooking.customerName}
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Completion Notes (Optional)
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about the completed service..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdatingBooking(null);
                  setStatusNotes('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusUpdate(updatingBooking.id, 'COMPLETED', statusNotes || undefined)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark as Completed
              </Button>
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