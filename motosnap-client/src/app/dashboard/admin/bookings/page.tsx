'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { BookingResponse, BookingStatus, BookingStatusUpdateRequest } from '@/types/booking';
import { Invoice } from '@/types/invoice';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import InvoicePreview from '@/components/InvoicePreview';

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [mechanicFilter, setMechanicFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  // Sorting state
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default: most recent first
  
  // Assignment loading state
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
  
  // Completed booking details modal state
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Invoice state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

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

  const handleViewCompletedBooking = async (booking: BookingResponse) => {
    setSelectedBooking(booking);
    setLoadingDetails(true);
    
    try {
      // Fetch parts requests for this booking
      const partsRequests = await apiClient.getPartsRequestsForBooking(booking.id);
      
      setBookingDetails({
        ...booking,
        partsRequests: partsRequests || []
      });
    } catch (err: any) {
      console.error('Failed to fetch booking details:', err);
      // Still show the modal even if parts requests fail
      setBookingDetails({
        ...booking,
        partsRequests: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeBookingDetailsModal = () => {
    setSelectedBooking(null);
    setBookingDetails(null);
  };

  const handleGenerateInvoice = async (bookingId: number) => {
    try {
      setGeneratingInvoice(true);
      console.log('DEBUG: Generating invoice for booking:', bookingId);
      
      const invoice = await apiClient.generateInvoice(bookingId);
      console.log('DEBUG: Invoice generated successfully:', invoice);
      
      setSelectedInvoice(invoice);
      setSuccess('Invoice generated successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to generate invoice:', err);
      setError(err?.error || 'Failed to generate invoice');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const closeInvoiceModal = () => {
    setSelectedInvoice(null);
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

  const formatLastModified = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleSortToggle = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const filteredBookings = bookings
    .filter(booking => {
      const matchesStatus = !statusFilter || booking.status === statusFilter;
      const matchesMechanic = !mechanicFilter || 
        (mechanicFilter === 'unassigned' ? !booking.assignedMechanicId : 
         booking.assignedMechanicId?.toString() === mechanicFilter);
      const matchesSearch = !searchFilter || 
        booking.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        booking.vehiclePlateNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
        booking.serviceName.toLowerCase().includes(searchFilter.toLowerCase());
      
      return matchesStatus && matchesMechanic && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
              variant="secondary"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
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
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="min-w-max">
              <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={handleSortToggle}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Modified</span>
                      <span className="text-gray-400">
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    </div>
                  </th>
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
                        <div className="font-medium">{formatLastModified(booking.updatedAt)}</div>
                        {new Date(booking.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                          <div className="text-xs text-blue-600 font-medium">Recent</div>
                        )}
                      </div>
                    </td>
                    
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
                      <div className="flex flex-col space-y-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ')}
                        </span>
                        
                        {/* Invoice Status Badge */}
                        {booking.status === 'COMPLETED' && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            booking.hasInvoice 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {booking.hasInvoice ? '📄 Invoiced' : '⏳ Needs Invoice'}
                          </span>
                        )}
                      </div>
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
                        {booking.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            onClick={() => handleViewCompletedBooking(booking)}
                            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1"
                          >
                            📋 View Details
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Completed Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Service Completion Report</h2>
                  <p className="text-gray-600 mt-1">Booking #{selectedBooking.id} - {selectedBooking.serviceName}</p>
                </div>
                <button
                  onClick={closeBookingDetailsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3">Loading booking details...</span>
                </div>
              ) : bookingDetails ? (
                <div className="space-y-8">
                  {/* Basic Booking Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Booking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Booking ID:</span>
                          <span className="font-medium text-gray-900">#{bookingDetails.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service:</span>
                          <span className="font-medium text-gray-900">{bookingDetails.serviceName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Price:</span>
                          <span className="font-medium text-gray-900">${bookingDetails.serviceBasePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {Math.floor(bookingDetails.serviceEstimatedDurationMinutes / 60)}h {bookingDetails.serviceEstimatedDurationMinutes % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium text-gray-900">{bookingDetails.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">{bookingDetails.customerEmail}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vehicle:</span>
                          <span className="font-medium text-gray-900">
                            {bookingDetails.vehiclePlateNo} - {bookingDetails.vehicleBrand} {bookingDetails.vehicleModel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mechanic:</span>
                          <span className="font-medium text-gray-900">{bookingDetails.assignedMechanicName || 'Not assigned'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Service Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Scheduled</div>
                        <div className="font-medium text-gray-900">{formatDateTime(bookingDetails.scheduledDateTime)}</div>
                      </div>
                      {bookingDetails.startedAt && (
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Started</div>
                          <div className="font-medium text-gray-900">{formatDateTime(bookingDetails.startedAt)}</div>
                        </div>
                      )}
                      {bookingDetails.completedAt && (
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Completed</div>
                          <div className="font-medium text-gray-900">{formatDateTime(bookingDetails.completedAt)}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {bookingDetails.notes && (
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Customer Notes</h3>
                      <p className="text-gray-700 bg-white p-4 rounded border">{bookingDetails.notes}</p>
                    </div>
                  )}

                  {/* Mechanic Completion Notes */}
                  {bookingDetails.statusNotes && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Mechanic Completion Notes</h3>
                      <p className="text-gray-700 bg-white p-4 rounded border">{bookingDetails.statusNotes}</p>
                    </div>
                  )}

                  {/* Parts Used */}
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Parts Used in Service</h3>
                    {bookingDetails.partsRequests && bookingDetails.partsRequests.length > 0 ? (
                      <div className="space-y-3">
                        {bookingDetails.partsRequests.map((request: any, index: number) => (
                          <div key={index} className="bg-white border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{request.partName}</div>
                                <div className="text-sm text-gray-600">
                                  Quantity: {request.quantity} | Price: ${(request.partPrice * request.quantity).toFixed(2)}
                                </div>
                                {request.reason && (
                                  <div className="text-sm text-gray-500 mt-1">Reason: {request.reason}</div>
                                )}
                              </div>
                              <div className="ml-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                  request.status === 'USED' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Parts Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-900">Total Parts Cost:</span>
                            <span className="text-gray-900">
                              ${bookingDetails.partsRequests
                                .filter((r: any) => r.status === 'APPROVED' || r.status === 'USED')
                                .reduce((sum: number, r: any) => sum + (r.partPrice * r.quantity), 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <p>No additional parts were used in this service</p>
                        <p className="text-sm">Only the base service was performed</p>
                      </div>
                    )}
                  </div>

                  {/* Service Summary */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Service Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Service Cost:</span>
                        <span className="font-medium text-black">${bookingDetails.serviceBasePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Additional Parts Cost:</span>
                        <span className="font-medium text-black">
                          ${bookingDetails.partsRequests
                            ?.filter((r: any) => r.status === 'APPROVED' || r.status === 'USED')
                            .reduce((sum: number, r: any) => sum + (r.partPrice * r.quantity), 0)
                            .toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-gray-900">Total Service Cost:</span>
                          <span className="text-gray-900">
                            ${(
                              bookingDetails.serviceBasePrice + 
                              (bookingDetails.partsRequests
                                ?.filter((r: any) => r.status === 'APPROVED' || r.status === 'USED')
                                .reduce((sum: number, r: any) => sum + (r.partPrice * r.quantity), 0) || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <div className="text-sm text-gray-500">
                      Service completed on {bookingDetails.completedAt ? formatDateTime(bookingDetails.completedAt) : 'Unknown date'}
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={closeBookingDetailsModal}
                        variant="secondary"
                        className="text-gray-600"
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => handleGenerateInvoice(bookingDetails.id)}
                        disabled={generatingInvoice}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📄 {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoicePreview
          invoice={selectedInvoice}
          onClose={closeInvoiceModal}
        />
      )}

    </div>
  );
}