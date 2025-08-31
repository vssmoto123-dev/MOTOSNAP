'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MECHANIC': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'CUSTOMER': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-text-muted bg-muted border-border';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Full system access - manage users, inventory, and services';
      case 'MECHANIC': return 'Service management - handle bookings and parts requests';
      case 'CUSTOMER': return 'Customer access - book services and view history';
      default: return 'Standard user access';
    }
  };

  const getAvailableFeatures = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return [
          'Manage Inventory',
          'User Management',
          'Service Configuration',
          'Reports & Analytics',
          'System Settings'
        ];
      case 'MECHANIC':
        return [
          'View Assigned Jobs',
          'Update Job Status',
          'Request Parts',
          'Service History',
          'Daily Schedule'
        ];
      case 'CUSTOMER':
        return [
          'Book Services',
          'View Service History',
          'Manage Vehicles',
          'Order Parts',
          'Upload Receipts'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-text">
                MOTO<span className="text-primary">SNAP</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-text">{user?.name}</p>
                <p className="text-xs text-text-muted">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-text-muted hover:text-text"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-text-muted">
            Manage your motorcycle workshop efficiently with MotoSnap
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text mb-2">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-text-muted">Role:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user?.role || '')}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-text-muted mt-0.5">Access:</span>
                  <span className="text-sm text-text-muted">
                    {getRoleDescription(user?.role || '')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation - Available for all users */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-text mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/dashboard/parts')}
              className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Browse Parts
            </Button>
            <Button
              onClick={() => router.push('/dashboard/cart')}
              className="h-16 bg-green-600 hover:bg-green-700 text-white"
            >
              Shopping Cart
            </Button>
            <Button
              onClick={() => router.push('/dashboard/profile')}
              className="h-16 bg-purple-600 hover:bg-purple-700 text-white"
            >
              My Profile
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                onClick={() => router.push('/dashboard/admin')}
                className="h-16 bg-red-600 hover:bg-red-700 text-white"
              >
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Debug Info - Shows current user role */}
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg">
          <p className="text-sm">
            <strong>Debug:</strong> Current user role: {user?.role} | 
            User ID: {user?.id} | 
            Email: {user?.email}
          </p>
        </div>

        {/* Available Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-2">
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-semibold text-text mb-4">Available Features</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {getAvailableFeatures(user?.role || '').map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Admin Panel Access - Only for ADMIN users */}
            {user?.role === 'ADMIN' && (
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-6 rounded-2xl border border-purple-500/20 shadow-lg">
                <h3 className="text-lg font-semibold text-text mb-2">Admin Panel</h3>
                <p className="text-text-muted text-sm mb-4">
                  Access administrative functions
                </p>
                <Button
                  onClick={() => router.push('/dashboard/admin')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white w-full"
                >
                  Open Admin Dashboard →
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-semibold text-text mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Active Services</span>
                  <span className="text-xl font-bold text-text">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Pending Orders</span>
                  <span className="text-xl font-bold text-text">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Low Stock Items</span>
                  <span className="text-xl font-bold text-warning">3</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-lg">
              <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-text">Service completed</p>
                    <p className="text-xs text-text-muted">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-text">New booking received</p>
                    <p className="text-xs text-text-muted">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-text">Low stock alert</p>
                    <p className="text-xs text-text-muted">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="mt-8 bg-muted/30 p-6 rounded-2xl border border-border/50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text mb-2">More Features Coming Soon</h3>
            <p className="text-text-muted mb-4">
              We&apos;re working on additional features for {user?.role?.toLowerCase()} users
            </p>
            <div className="flex justify-center space-x-4 text-sm text-text-muted">
              <span>🚀 Advanced Analytics</span>
              <span>📱 Mobile App</span>
              <span>🔔 Real-time Notifications</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}