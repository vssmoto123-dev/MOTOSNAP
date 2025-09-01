'use client';

import React, { useState, useEffect } from 'react';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-black">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium">Name</label>
            <p className="text-lg text-black">{profile.name}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium">Email</label>
            <p className="text-lg text-black">{profile.email}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium">Phone</label>
            <p className="text-lg text-black">{profile.phone || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium">Role</label>
            <p className="text-lg capitalize text-black">{profile.role.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">My Vehicles</h2>
          <button
            onClick={() => setShowAddVehicle(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Vehicle
          </button>
        </div>

        {/* Vehicles List */}
        {profile.vehicles && profile.vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 text-black">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <div className="text-gray-600 space-y-1">
                  <p><span className="font-medium">Plate:</span> {vehicle.plateNo}</p>
                  <p><span className="font-medium">Year:</span> {vehicle.year}</p>
                  {vehicle.color && (
                    <p><span className="font-medium">Color:</span> {vehicle.color}</p>
                  )}
                  {vehicle.engineCapacity && (
                    <p><span className="font-medium">Engine:</span> {vehicle.engineCapacity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No vehicles registered</p>
        )}

        {/* Add Vehicle Modal */}
        {showAddVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-semibold mb-4 text-black">Add New Vehicle</h3>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Plate Number *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.plateNo}
                    onChange={(e) => setVehicleForm({...vehicleForm, plateNo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Brand *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({...vehicleForm, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Model *</label>
                  <input
                    type="text"
                    required
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Year *</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Color</label>
                  <input
                    type="text"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Engine Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g., 150cc, 1.6L"
                    value={vehicleForm.engineCapacity}
                    onChange={(e) => setVehicleForm({...vehicleForm, engineCapacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}