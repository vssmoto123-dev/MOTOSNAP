'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  console.log('📊 Main Dashboard loading...', { userRole: user?.role });

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
      {user?.role === 'ADMIN' ? (
        // Admin View - No sidebar, just header and content
        <>
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
                    {user?.role === 'ADMIN' && (
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Parts Requests</span>
                        <span className="text-xl font-bold text-orange-600">New</span>
                      </div>
                    )}
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
          </main>
        </>
      ) : (
        // Customer/Mechanic View - With sidebar
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg">
            <div className="flex flex-col h-screen">
              {/* Header */}
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  MOTO<span className="text-primary">SNAP</span>
                </h2>
                <p className="text-sm text-gray-600">
                  {user?.role === 'MECHANIC' ? 'Mechanic Dashboard' : 'Customer Dashboard'}
                </p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {user?.role === 'CUSTOMER' && (
                  <>
                    <Button
                      onClick={() => router.push('/dashboard/services')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Book Services
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/parts')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Browse Parts
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/cart')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Shopping Cart
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/profile')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/orders')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      My Orders
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard/bookings')}
                      variant="ghost"
                      className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
                      </svg>
                      My Bookings
                    </Button>
                  </>
                )}
                {user?.role === 'MECHANIC' && (
                  <Button
                    onClick={() => router.push('/dashboard/mechanic/bookings')}
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    My Assignments
                  </Button>
                )}
              </nav>

              {/* User info and logout */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="w-full text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-background">
            <main className="p-8">
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
                    {user?.role === 'ADMIN' && (
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Parts Requests</span>
                        <span className="text-xl font-bold text-orange-600">New</span>
                      </div>
                    )}
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
            </main>
          </div>
        </div>
      )}
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