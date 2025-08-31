'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

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
