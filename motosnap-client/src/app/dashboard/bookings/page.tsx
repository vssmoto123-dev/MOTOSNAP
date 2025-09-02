'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { BookingResponse, BookingStatus } from '@/types/booking';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserBookings();
      setBookings(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Track your service appointments and their progress</p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by booking a service for your motorcycle.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard/services')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Book a Service
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{booking.serviceName}</h3>
                  <p className="text-sm text-gray-600">Booking #{booking.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{booking.serviceCategory}</span>
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

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="text-gray-900">{formatDateTime(booking.scheduledDateTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="text-gray-900">{booking.vehiclePlateNo} - {booking.vehicleBrand} {booking.vehicleModel}</span>
                    </div>
                    {booking.assignedMechanicName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mechanic:</span>
                        <span className="text-gray-900">{booking.assignedMechanicName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
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
                  <span className="block font-medium">Booked</span>
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