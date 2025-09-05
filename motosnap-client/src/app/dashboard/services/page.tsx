'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Service {
  id: number;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  active: boolean;
}

interface Vehicle {
  id: number;
  plateNo: string;
  model: string;
  brand: string;
  year: number;
  color?: string;
  engineCapacity?: string;
}

interface BookingForm {
  serviceId: number;
  vehicleId: number;
  scheduledDateTime: string;
  notes: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    serviceId: 0,
    vehicleId: 0,
    scheduledDateTime: '',
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchVehicles();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const fetchedServices = await apiClient.getPublicServices();
      setServices(fetchedServices as any);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(fetchedServices.map(s => s.category))];
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const userVehicles = await apiClient.getUserVehicles();
      setVehicles(userVehicles);
    } catch (err: any) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'ALL' || service.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openBookingModal = (service: Service) => {
    setSelectedService(service);
    setBookingForm({
      serviceId: service.id,
      vehicleId: 0,
      scheduledDateTime: '',
      notes: ''
    });
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingForm({
      serviceId: 0,
      vehicleId: 0,
      scheduledDateTime: '',
      notes: ''
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.vehicleId || !bookingForm.scheduledDateTime) {
      alert('Please select a vehicle and scheduling date/time');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Prepare booking data for API
      const bookingData = {
        serviceId: bookingForm.serviceId,
        vehicleId: bookingForm.vehicleId,
        scheduledDateTime: bookingForm.scheduledDateTime,
        notes: bookingForm.notes
      };
      
      console.log('Submitting booking:', bookingData);
      
      // Call the booking API
      const response = await apiClient.createBooking(bookingData);
      
      console.log('Booking created successfully:', response);
      
      alert(`Booking request submitted successfully!\n\nBooking ID: ${response.id}\nService: ${selectedService?.name}\nScheduled: ${new Date(bookingForm.scheduledDateTime).toLocaleString()}\nEstimated Price: $${selectedService?.basePrice}.`);
      closeBookingModal();
      
    } catch (err: any) {
      console.error('Failed to submit booking:', err);
      const errorMessage = err?.error || 'Failed to submit booking. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate time slots for today and next 7 days
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(now.getDate() + day);
      
      // Skip past times for today - use larger buffer for server timezone differences
      const startHour = day === 0 ? Math.max(now.getHours() + 4, 9) : 9;
      
      for (let hour = startHour; hour <= 17; hour++) {
        if (hour === 12 || hour === 13) continue; // Skip lunch hours
        
        const datetime = new Date(date);
        datetime.setHours(hour, 0, 0, 0);
        
        // Format as local datetime string (YYYY-MM-DDTHH:mm:ss) to avoid UTC conversion issues
        const year = datetime.getFullYear();
        const month = String(datetime.getMonth() + 1).padStart(2, '0');
        const dayStr = String(datetime.getDate()).padStart(2, '0');
        const hourStr = String(datetime.getHours()).padStart(2, '0');
        const minute = String(datetime.getMinutes()).padStart(2, '0');
        const second = String(datetime.getSeconds()).padStart(2, '0');
        
        slots.push({
          value: `${year}-${month}-${dayStr}T${hourStr}:${minute}:${second}`,
          label: `${datetime.toLocaleDateString()} at ${datetime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-text-muted text-lg">Loading motorcycle services...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-text mb-3">Book Services</h1>
              <p className="text-text-muted text-lg">Professional motorcycle maintenance and repair services</p>
            </div>
          </div>
          
          {/* Error State */}
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-text mb-2">Unable to Load Services</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-text mb-3">Book Services</h1>
            <p className="text-text-muted text-lg">Professional motorcycle maintenance and repair services</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-text font-medium mb-2">Search Services</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-text font-medium mb-2">Filter by Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'ALL'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-text hover:bg-muted/80'
                  }`}
                >
                  All Services
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-muted text-text hover:bg-muted/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results Summary */}
          {(searchQuery || selectedCategory !== 'ALL') && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-text-muted">
                Showing {filteredServices.length} of {services.length} services
                {searchQuery && <span> matching "{searchQuery}"</span>}
                {selectedCategory !== 'ALL' && <span> in "{selectedCategory}"</span>}
              </p>
            </div>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-12 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto mb-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-2xl font-semibold text-text mb-3">No Services Found</h3>
              <p className="text-text-muted text-lg mb-8">
                {searchQuery ? `No services match "${searchQuery}"` : 'No services available in this category'}
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
            >
              Show All Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  {/* Service Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-text mb-2">{service.name}</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-text-muted mb-6 leading-relaxed">{service.description}</p>
                  
                  {/* Service Details */}
                  <div className="bg-background rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-text-muted font-medium">Base Price</span>
                      </div>
                      <span className="text-2xl font-bold text-text">${service.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-text-muted font-medium">Duration</span>
                      </div>
                      <span className="text-text font-semibold">
                        {Math.floor(service.estimatedDurationMinutes / 60)}h {service.estimatedDurationMinutes % 60}m
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openBookingModal(service)}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
                  >
                    Book This Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-text">Book Service</h3>
                  <button
                    onClick={closeBookingModal}
                    className="text-text-muted hover:text-text transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-text-muted mt-1">{selectedService.name}</p>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  <div>
                    <label className="block text-text font-medium mb-3">Select Vehicle *</label>
                    {vehicles.length > 0 ? (
                      <select
                        required
                        value={bookingForm.vehicleId}
                        onChange={(e) => setBookingForm({...bookingForm, vehicleId: parseInt(e.target.value)})}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                      >
                        <option value={0}>Choose a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNo} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-text p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-yellow-800">No vehicles found. Please add a vehicle in your profile first.</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-text font-medium mb-3">Preferred Date & Time *</label>
                    <select
                      required
                      value={bookingForm.scheduledDateTime}
                      onChange={(e) => setBookingForm({...bookingForm, scheduledDateTime: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                    >
                      <option value="">Select date and time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-text font-medium mb-3">Additional Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Any specific issues or requests..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text resize-none"
                    />
                  </div>
                  
                  {/* Service Summary */}
                  <div className="bg-background rounded-xl p-5 border border-border">
                    <h4 className="font-semibold text-text text-lg mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Service Summary
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Service:</span>
                        <span className="text-text font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Category:</span>
                        <span className="text-text">{selectedService.category}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Base Price:</span>
                        <span className="text-text font-bold text-lg">${selectedService.basePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Est. Duration:</span>
                        <span className="text-text">{Math.floor(selectedService.estimatedDurationMinutes / 60)}h {selectedService.estimatedDurationMinutes % 60}m</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={bookingLoading || vehicles.length === 0}
                      className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
                    >
                      {bookingLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : 'Submit Booking'}
                    </button>
                    <button
                      type="button"
                      onClick={closeBookingModal}
                      className="flex-1 bg-muted text-text py-3 px-4 rounded-lg hover:bg-muted/80 font-medium text-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}