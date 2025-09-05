'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Vehicle {
  id: number;
  plateNo: string;
  model: string;
  brand: string;
  year: number;
  color?: string;
  engineCapacity?: string;
}

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  vehicles: Vehicle[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  
  const [vehicleForm, setVehicleForm] = useState({
    plateNo: '',
    model: '',
    brand: '',
    year: new Date().getFullYear(),
    color: '',
    engineCapacity: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUserProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.addVehicle(vehicleForm);
      setShowAddVehicle(false);
      setVehicleForm({
        plateNo: '',
        model: '',
        brand: '',
        year: new Date().getFullYear(),
        color: '',
        engineCapacity: ''
      });
      fetchProfile(); // Refresh profile to show new vehicle
    } catch (err) {
      alert('Failed to add vehicle');
      console.error('Error adding vehicle:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-text-muted text-lg">Loading your profile...</p>
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
              <h1 className="text-4xl font-bold text-text mb-3">My Profile</h1>
              <p className="text-text-muted text-lg">Manage your account and vehicle information</p>
            </div>
          </div>
          
          {/* Error State */}
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-xl font-semibold text-text mb-2">Unable to Load Profile</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <button
                onClick={fetchProfile}
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-xl font-semibold text-text mb-2">Profile Not Found</h3>
              <p className="text-text-muted">Unable to load your profile information</p>
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
            <h1 className="text-4xl font-bold text-text mb-3">My Profile</h1>
            <p className="text-text-muted text-lg">Manage your account and vehicle information</p>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text mb-1">Personal Information</h2>
              <p className="text-text-muted">Your account details and contact information</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <label className="block text-text-muted text-sm font-medium">Full Name</label>
              </div>
              <p className="text-lg font-semibold text-text">{profile.name}</p>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <label className="block text-text-muted text-sm font-medium">Email Address</label>
              </div>
              <p className="text-lg font-semibold text-text">{profile.email}</p>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <label className="block text-text-muted text-sm font-medium">Phone Number</label>
              </div>
              <p className="text-lg font-semibold text-text">{profile.phone || 'Not provided'}</p>
            </div>
            
            <div className="bg-background rounded-xl p-4 border border-border">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z\" />
                </svg>
                <label className="block text-text-muted text-sm font-medium">Account Role</label>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                {profile.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center text-text-muted text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-5 8l2 2 4-4m-6-6h.01M19 4v16l-4-2-4 2-4-2-4 2V4l4-2 4 2 4-2 4 2z" />
              </svg>
              Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {/* Vehicles Section */}
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10l-7 7-7-7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text mb-1">My Vehicles</h2>
                <p className="text-text-muted">Registered motorcycles for service bookings</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddVehicle(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          </div>

          {/* Vehicles List */}
          {profile.vehicles && profile.vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-background rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text mb-1">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-text-muted text-sm">{vehicle.year} Model</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-text-muted text-sm font-medium mr-2">Plate:</span>
                      <span className="text-text font-semibold">{vehicle.plateNo}</span>
                    </div>
                    
                    {vehicle.color && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                        <span className="text-text-muted text-sm font-medium mr-2">Color:</span>
                        <span className="text-text">{vehicle.color}</span>
                      </div>
                    )}
                    
                    {vehicle.engineCapacity && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-text-muted text-sm font-medium mr-2">Engine:</span>
                        <span className="text-text">{vehicle.engineCapacity}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-muted rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 10l-7 7-7-7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">No Vehicles Registered</h3>
              <p className="text-text-muted text-lg mb-6">Add your motorcycle to start booking services</p>
              <button
                onClick={() => setShowAddVehicle(true)}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
              >
                Add Your First Vehicle
              </button>
            </div>
          )}

          {/* Add Vehicle Modal */}
          {showAddVehicle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-text">Add New Vehicle</h3>
                    <button
                      onClick={() => setShowAddVehicle(false)}
                      className="text-text-muted hover:text-text transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-text-muted mt-1">Register your motorcycle for service bookings</p>
                </div>
                
                {/* Modal Body */}
                <div className="p-6">
                  <form onSubmit={handleAddVehicle} className="space-y-6">
                    <div>
                      <label className="block text-text font-medium mb-2">Plate Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter license plate number"
                        value={vehicleForm.plateNo}
                        onChange={(e) => setVehicleForm({...vehicleForm, plateNo: e.target.value})}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-text font-medium mb-2">Brand *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Yamaha, Honda"
                          value={vehicleForm.brand}
                          onChange={(e) => setVehicleForm({...vehicleForm, brand: e.target.value})}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-text font-medium mb-2">Model *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., YZF-R15, CBR150R"
                          value={vehicleForm.model}
                          onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-text font-medium mb-2">Year *</label>
                        <input
                          type="number"
                          required
                          min="1900"
                          max={new Date().getFullYear() + 1}
                          value={vehicleForm.year}
                          onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-text font-medium mb-2">Color</label>
                        <input
                          type="text"
                          placeholder="e.g., Red, Black, Blue"
                          value={vehicleForm.color}
                          onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-text font-medium mb-2">Engine Capacity</label>
                      <input
                        type="text"
                        placeholder="e.g., 150cc, 250cc, 1000cc"
                        value={vehicleForm.engineCapacity}
                        onChange={(e) => setVehicleForm({...vehicleForm, engineCapacity: e.target.value})}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg"
                      >
                        Add Vehicle
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddVehicle(false)}
                        className="flex-1 bg-muted text-text py-3 px-4 rounded-lg hover:bg-muted/80 transition-colors font-medium text-lg"
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
    </div>
  );
}