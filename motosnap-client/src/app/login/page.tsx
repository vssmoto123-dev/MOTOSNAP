'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoginRequest } from '@/types/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const quickFillOptions = [
    { label: 'Admin User', email: 'admin@motosnap.com', password: 'Admin123!' },
    { label: 'Mechanic User', email: 'mechanic@motosnap.com', password: 'Mechanic123!' },
    { label: 'Customer User', email: 'customer@motosnap.com', password: 'Customer123!' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setApiError('');
  };

  const handleQuickFill = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
    setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await login(formData);
      router.push('/dashboard');
    } catch (error: unknown) {
      const errorMessage = (error && typeof error === 'object' && 'error' in error) 
        ? (error as { error: string }).error 
        : 'Login failed. Please check your credentials.';
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-text mb-2 tracking-tight">
              MOTO<span className="text-primary">SNAP</span>
            </h1>
          </Link>
          <p className="text-text-muted">Welcome back! Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <Alert variant="error" title="Login Failed">
                {apiError}
              </Alert>
            )}

            {/* Quick Fill Demo Users */}
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <p className="text-sm font-medium text-text mb-3">Quick Login (Demo Users):</p>
              <div className="flex flex-wrap gap-2">
                {quickFillOptions.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleQuickFill(option.email, option.password)}
                    className="text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <div className="space-y-2">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary hover:text-red-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-secondary"
              />
              <label htmlFor="remember-me" className="ml-3 text-sm text-text-muted">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-text-muted">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:text-red-400 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-surface/50 p-4 rounded-lg border border-border/30">
            <h3 className="text-sm font-medium text-text mb-2">New to MotoSnap?</h3>
            <p className="text-sm text-text-muted mb-3">
              Manage your motorcycle parts and services with ease
            </p>
            <div className="flex justify-center space-x-4 text-xs text-text-muted">
              <span>✓ Inventory Management</span>
              <span>✓ Service Booking</span>
              <span>✓ Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}