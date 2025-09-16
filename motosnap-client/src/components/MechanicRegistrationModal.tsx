'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { RegisterRequest } from '@/types/auth';
import apiClient from '@/lib/api';
import Toast from '@/components/ui/Toast';

interface MechanicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MechanicRegistrationModal({ isOpen, onClose, onSuccess }: MechanicRegistrationModalProps) {
  const [formData, setFormData] = useState<Omit<RegisterRequest, 'role'> & { role: 'MECHANIC' }>({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'MECHANIC',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdMechanic, setCreatedMechanic] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required for mechanics';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const response = await apiClient.adminRegister(formData);
      setCreatedMechanic(response.user);
      setSuccess(true);
      onSuccess(); // Refresh dashboard data

      // Show success toast
      setToastMessage(`Mechanic ${response.user.name} registered successfully!`);
      setToastType('success');
      setShowToast(true);

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = (error && typeof error === 'object' && 'error' in error)
        ? (error as { error: string }).error
        : 'Registration failed. Please try again.';
      setApiError(errorMessage);

      // Show error toast
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'MECHANIC',
    });
    setConfirmPassword('');
    setErrors({});
    setApiError('');
    setSuccess(false);
    setCreatedMechanic(null);
    setShowToast(false);
    setToastMessage('');
    onClose();
  };

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&';

    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Add 4 more random characters
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = 0; i < 4; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    setFormData(prev => ({ ...prev, password }));
    setConfirmPassword(password);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Register New Mechanic
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success && createdMechanic ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mechanic Registered Successfully!
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <p className="text-sm text-gray-600"><strong>Name:</strong> {createdMechanic.name}</p>
                  <p className="text-sm text-gray-600"><strong>Email:</strong> {createdMechanic.email}</p>
                  <p className="text-sm text-gray-600"><strong>Phone:</strong> {createdMechanic.phone || 'Not provided'}</p>
                  <p className="text-sm text-gray-600"><strong>Role:</strong> {createdMechanic.role}</p>
                </div>
                <p className="text-sm text-gray-500">
                  The mechanic can now log in with their credentials. This window will close automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {apiError && (
                  <Alert variant="error" title="Registration Failed">
                    {apiError}
                  </Alert>
                )}

                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter mechanic's full name"
                  required
                  autoComplete="name"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="mechanic@email.com"
                  required
                  autoComplete="email"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+60 12-345 6789"
                  required
                  autoComplete="tel"
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      Generate Strong Password
                    </button>
                  </div>
                  <Input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                    helperText="Must contain uppercase, lowercase, number and special character"
                  />
                </div>

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  error={errors.confirmPassword}
                  placeholder="Confirm the password"
                  required
                  autoComplete="new-password"
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    className="flex-1"
                  >
                    Register Mechanic
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={4000}
      />
    </div>
  );
}