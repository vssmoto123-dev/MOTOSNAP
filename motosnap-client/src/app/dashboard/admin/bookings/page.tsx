'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { BookingResponse, BookingStatus, BookingStatusUpdateRequest } from '@/types/booking';
import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [mechanics, setMechanics] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [mechanicFilter, setMechanicFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Assignment loading state
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
    fetchMechanics();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllBookings(searchFilter, statusFilter);
      setBookings(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      setError(err?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMechanics = async () => {
    try {
      const users = await apiClient.getUsers();
      setMechanics(users.filter(u => u.role === 'MECHANIC'));
    } catch (err: any) {
      console.error('Failed to fetch mechanics:', err);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      const updateRequest: BookingStatusUpdateRequest = {
        status: newStatus
      };
      
      await apiClient.updateBookingStatus(bookingId, updateRequest);
      setSuccess(`Booking status updated to ${newStatus}`);
      fetchBookings();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      setError(err?.error || 'Failed to update booking status');
    }
  };

  const handleMechanicAssignment = async (bookingId: number, mechanicId: number, confirmBooking: boolean = false) => {
    if (!mechanicId) return;
    
    try {
      setAssigningBookingId(bookingId);
      await apiClient.assignMechanic(bookingId, mechanicId);
      
      if (confirmBooking) {
        // Also confirm the booking after assigning mechanic
        const updateRequest: BookingStatusUpdateRequest = { status: 'CONFIRMED' };
        await apiClient.updateBookingStatus(bookingId, updateRequest);
        setSuccess(`Mechanic assigned and booking confirmed`);
      } else {
        setSuccess(`Mechanic assigned successfully`);
      }
      
      fetchBookings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to assign mechanic:', err);
      setError(err?.error || 'Failed to assign mechanic');
    } finally {
      setAssigningBookingId(null);
    }
  };

  const handleConfirmWithAssignment = async (bookingId: number, mechanicId?: number) => {
    if (mechanicId) {
      // Assign mechanic and confirm in one action
      await handleMechanicAssignment(bookingId, mechanicId, true);
    } else {
      // Just confirm without assignment
      await handleStatusUpdate(bookingId, 'CONFIRMED');
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

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    const matchesMechanic = !mechanicFilter || 
      (mechanicFilter === 'unassigned' ? !booking.assignedMechanicId : 
       booking.assignedMechanicId?.toString() === mechanicFilter);
    const matchesSearch = !searchFilter || 
      booking.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      booking.vehiclePlateNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
      booking.serviceName.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesStatus && matchesMechanic && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Manage service bookings and assign mechanics</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total Bookings: <span className="font-semibold">{bookings.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Filtered Results: <span className="font-semibold">{filteredBookings.length}</span>
          </div>
        </div>
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Customer, plate, or service..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mechanic
            </label>
            <select
              value={mechanicFilter}
              onChange={(e) => setMechanicFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Mechanics</option>
              <option value="unassigned">Unassigned</option>
              {mechanics.map(mechanic => (
                <option key={mechanic.id} value={mechanic.id.toString()}>
                  {mechanic.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <Button
              onClick={fetchBookings}
              className="w-full"
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">No bookings match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mechanic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">#{booking.id}</div>
                        <div className="text-gray-500">
                          {formatDateTime(booking.scheduledDateTime)}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-gray-500">{booking.customerEmail}</div>
                        <div className="text-gray-500">
                          {booking.vehiclePlateNo} - {booking.vehicleBrand} {booking.vehicleModel}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{booking.serviceName}</div>
                        <div className="text-gray-500">${booking.serviceBasePrice.toFixed(2)}</div>
                        <div className="text-gray-500">
                          {Math.floor(booking.serviceEstimatedDurationMinutes / 60)}h {booking.serviceEstimatedDurationMinutes % 60}m
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.assignedMechanicName ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{booking.assignedMechanicName}</span>
                            {booking.status === 'PENDING' && (
                              <select
                                onChange={(e) => {
                                  const mechanicId = parseInt(e.target.value);
                                  if (mechanicId && mechanicId !== booking.assignedMechanicId) {
                                    handleMechanicAssignment(booking.id, mechanicId);
                                  }
                                }}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                                disabled={assigningBookingId === booking.id}
                              >
                                <option value="">Change...</option>
                                {mechanics
                                  .filter(m => m.id !== booking.assignedMechanicId)
                                  .map(mechanic => (
                                  <option key={mechanic.id} value={mechanic.id}>
                                    {mechanic.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              const mechanicId = parseInt(e.target.value);
                              if (mechanicId) {
                                handleMechanicAssignment(booking.id, mechanicId);
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={assigningBookingId === booking.id}
                            defaultValue=""
                          >
                            <option value="">
                              {assigningBookingId === booking.id ? 'Assigning...' : 'Select mechanic...'}
                            </option>
                            {mechanics.map(mechanic => (
                              <option key={mechanic.id} value={mechanic.id}>
                                {mechanic.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                      {/* Status Update Buttons */}
                      <div className="flex flex-wrap gap-1">
                        {booking.status === 'PENDING' && (
                          <>
                            {booking.assignedMechanicId ? (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                              >
                                Confirm Booking
                              </Button>
                            ) : (
                              <div className="text-xs text-gray-500 italic">
                                Assign mechanic first
                              </div>
                            )}
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                          >
                            Start Service
                          </Button>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                          >
                            Complete Service
                          </Button>
                        )}
                        {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}