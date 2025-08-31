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
      // For now, we'll create a temporary list of services since the API is admin-only
      // TODO: Create customer-accessible service endpoints
      const mockServices: Service[] = [
        {
          id: 1,
          name: 'Basic Service',
          category: 'Maintenance',
          description: 'Complete basic maintenance including oil change, filter replacement, and basic inspection.',
          basePrice: 150.00,
          estimatedDurationMinutes: 120,
          active: true
        },
        {
          id: 2,
          name: 'Full Service',
          category: 'Maintenance',
          description: 'Comprehensive service including all basic service items plus brake check, chain adjustment, and battery test.',
          basePrice: 250.00,
          estimatedDurationMinutes: 180,
          active: true
        },
        {
          id: 3,
          name: 'Engine Tune-up',
          category: 'Performance',
          description: 'Complete engine tuning including carburetor cleaning, spark plug replacement, and timing adjustment.',
          basePrice: 300.00,
          estimatedDurationMinutes: 240,
          active: true
        },
        {
          id: 4,
          name: 'Brake Service',
          category: 'Safety',
          description: 'Brake pad replacement, brake fluid change, and brake system inspection.',
          basePrice: 180.00,
          estimatedDurationMinutes: 90,
          active: true
        },
        {
          id: 5,
          name: 'Chain and Sprocket',
          category: 'Drivetrain',
          description: 'Chain cleaning, lubrication, adjustment, and sprocket inspection.',
          basePrice: 80.00,
          estimatedDurationMinutes: 60,
          active: true
        },
        {
          id: 6,
          name: 'Electrical Diagnosis',
          category: 'Electrical',
          description: 'Complete electrical system diagnosis and repair.',
          basePrice: 120.00,
          estimatedDurationMinutes: 120,
          active: true
        }
      ];
      
      setServices(mockServices);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(mockServices.map(s => s.category))];
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

  const filteredServices = selectedCategory === 'ALL' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

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
      
      // TODO: Implement booking API call
      console.log('Booking submission:', {
        ...bookingForm,
        serviceName: selectedService?.name,
        servicePrice: selectedService?.basePrice
      });
      
      // Mock success for now
      alert(`Booking request submitted successfully!\n\nService: ${selectedService?.name}\nEstimated Price: $${selectedService?.basePrice}\n\nYou will receive a confirmation email shortly.`);
      closeBookingModal();
      
    } catch (err: any) {
      console.error('Failed to submit booking:', err);
      alert('Failed to submit booking. Please try again.');
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
      
      // Skip past times for today
      const startHour = day === 0 ? Math.max(now.getHours() + 2, 9) : 9;
      
      for (let hour = startHour; hour <= 17; hour++) {
        if (hour === 12 || hour === 13) continue; // Skip lunch hours
        
        const datetime = new Date(date);
        datetime.setHours(hour, 0, 0, 0);
        
        slots.push({
          value: datetime.toISOString().slice(0, 16),
          label: `${datetime.toLocaleDateString()} at ${datetime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading services...</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Book Services</h1>
        <p className="text-gray-600 mt-2">Choose from our professional motorcycle services</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {service.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Price:</span>
                  <span className="font-semibold text-gray-900">${service.basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-700">{Math.floor(service.estimatedDurationMinutes / 60)}h {service.estimatedDurationMinutes % 60}m</span>
                </div>
              </div>
              
              <button
                onClick={() => openBookingModal(service)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Book This Service
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Book Service: {selectedService.name}</h3>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Select Vehicle *</label>
                {vehicles.length > 0 ? (
                  <select
                    required
                    value={bookingForm.vehicleId}
                    onChange={(e) => setBookingForm({...bookingForm, vehicleId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value={0}>Choose a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plateNo} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    No vehicles found. Please add a vehicle in your profile first.
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Preferred Date & Time *</label>
                <select
                  required
                  value={bookingForm.scheduledDateTime}
                  onChange={(e) => setBookingForm({...bookingForm, scheduledDateTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                <label className="block text-sm font-medium mb-1 text-gray-900">Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="Any specific issues or requests..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Service Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="text-gray-900">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{selectedService.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="text-gray-900 font-medium">${selectedService.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="text-gray-900">{Math.floor(selectedService.estimatedDurationMinutes / 60)}h {selectedService.estimatedDurationMinutes % 60}m</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={bookingLoading || vehicles.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                >
                  {bookingLoading ? 'Submitting...' : 'Submit Booking'}
                </button>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
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