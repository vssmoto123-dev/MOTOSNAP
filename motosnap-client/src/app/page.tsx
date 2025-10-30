'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { apiClient, getImageBaseUrl } from '@/lib/api';
import { LoginRequest } from '@/types/auth';

interface InventoryItem {
  id: number;
  partName: string;
  partCode: string;
  description?: string;
  qty: number;
  unitPrice: number;
  category?: string;
  brand?: string;
  active: boolean;
  imageUrl?: string;
}

export default function HomePage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Login form state
  const [loginFormData, setLoginFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginApiError, setLoginApiError] = useState('');

  useEffect(() => {
    // Redirect based on user role if already authenticated
    if (user && !loading) {
      if (user.role === 'CUSTOMER') {
        router.push('/dashboard/parts');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch products for display
    const fetchProducts = async () => {
      try {
        const data = await apiClient.getParts();
        setProducts(data.slice(0, 6)); // Show first 6 products
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Login form handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (loginErrors[name]) {
      setLoginErrors(prev => ({ ...prev, [name]: '' }));
    }
    setLoginApiError('');
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginFormData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginFormData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!loginFormData.password) {
      newErrors.password = 'Password is required';
    }

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    setLoginLoading(true);
    setLoginApiError('');

    try {
      await login(loginFormData);
      setShowLoginModal(false);
      // Reset form
      setLoginFormData({ email: '', password: '' });
      setLoginErrors({});
      setLoginApiError('');
      // Redirect is handled by useEffect based on user role
    } catch (error: unknown) {
      const errorMessage = (error && typeof error === 'object' && 'error' in error)
        ? (error as { error: string }).error
        : 'Login failed. Please check your credentials.';
      setLoginApiError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleProductClick = () => {
    if (!user) {
      setShowLoginModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show homepage if user is authenticated (will redirect to dashboard)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-text mb-6 tracking-tight">
              MOTO<span className="text-primary">SNAP</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto">
              Professional motorcycle workshop management system. 
              Streamline your parts inventory, service bookings, and customer management.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="min-w-[200px]"
                onClick={() => router.push('/register')}
              >
                Get Started
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="min-w-[200px]"
                onClick={() => router.push('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Everything you need to manage your motorcycle workshop
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            From inventory tracking to service management, MotoSnap provides all the tools 
            you need to run an efficient motorcycle workshop.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Inventory Management */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-4">Inventory Management</h3>
            <p className="text-text-muted leading-relaxed">
              Track parts inventory with real-time updates, low stock alerts, and automated 
              stock deduction when mechanics request parts.
            </p>
          </div>

          {/* Service Booking */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-4">Service Booking</h3>
            <p className="text-text-muted leading-relaxed">
              Online booking system for customers with mechanic assignment, 
              job tracking, and automated status updates throughout the service process.
            </p>
          </div>

          {/* Customer Management */}
          <div className="bg-surface p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-text mb-4">Customer Management</h3>
            <p className="text-text-muted leading-relaxed">
              Manage customer profiles, vehicle records, service history, and 
              parts orders with integrated receipt upload and approval system.
            </p>
          </div>
        </div>
      </section>

      {/* Products Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {productsLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-surface rounded-2xl border border-border shadow-lg overflow-hidden transition-all duration-300 group ${
                  user ? 'hover:shadow-xl cursor-pointer' : 'cursor-pointer hover:shadow-xl opacity-90'
                }`}
                onClick={handleProductClick}
              >
                {/* Product Image */}
                <div className="relative h-48 bg-muted/30">
                  {product.imageUrl ? (
                    <img
                      src={`${getImageBaseUrl()}${product.imageUrl}`}
                      alt={product.partName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-4xl font-bold text-text opacity-20">
                        {product.partName.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${
                    product.qty > 0
                      ? product.qty > 10
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.qty > 0 ? `${product.qty} in stock` : 'Out of stock'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  {/* Brand */}
                  {product.brand && (
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                      {product.brand}
                    </div>
                  )}

                  {/* Product Name */}
                  <h3 className="text-lg font-semibold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.partName}
                  </h3>

                  {/* Part Code */}
                  <p className="text-text-muted text-sm mb-4">Part #: {product.partCode}</p>

                  {/* Description */}
                  {product.description && (
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">{product.description}</p>
                  )}

                  {/* Price */}
                  <div className="text-2xl font-bold text-text mb-4">
                    MYR {typeof product.unitPrice === 'number' ? product.unitPrice.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-surface p-12 rounded-3xl border border-border text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
            Ready to streamline your workshop?
          </h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Join motorcycle workshops using MotoSnap to improve 
            their efficiency and customer satisfaction.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="min-w-[200px]"
              onClick={() => router.push('/register')}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="min-w-[200px]"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text">Sign In</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-text-muted mt-2">Sign in to view product details</p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {loginApiError && (
                <Alert variant="error" title="Login Failed">
                  {loginApiError}
                </Alert>
              )}

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={loginFormData.email}
                onChange={handleLoginChange}
                error={loginErrors.email}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />

              <div className="space-y-2">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={loginFormData.password}
                  onChange={handleLoginChange}
                  error={loginErrors.password}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  showPasswordToggle={true}
                />
              </div>

  
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loginLoading}
                  className="flex-1"
                  size="lg"
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/register');
                  }}
                  size="lg"
                >
                  Register
                </Button>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 pb-6 text-center">
              <p className="text-sm text-text-muted">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/register');
                  }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-secondary border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-text mb-4">
              MOTO<span className="text-primary">SNAP</span>
            </h3>
            <p className="text-text-muted mb-6">
              Professional motorcycle workshop management
            </p>
            <p className="text-xs text-text-muted mt-6">
              © 2024 MotoSnap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
