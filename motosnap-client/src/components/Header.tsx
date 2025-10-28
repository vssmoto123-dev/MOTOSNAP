'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show header on authentication pages, admin dashboards, or for mechanics
  const hideHeader = pathname.startsWith('/login') ||
                    pathname.startsWith('/register') ||
                    pathname.startsWith('/staff/register') ||
                    pathname.startsWith('/dashboard/admin') ||
                    pathname.startsWith('/dashboard/mechanic') ||
                    (user && user.role === 'MECHANIC') ||
                    (user && user.role === 'ADMIN' && (pathname === '/dashboard' || pathname === '/dashboard/')) ||
                    (!user && pathname.startsWith('/dashboard'));

  // Debug logging (remove in production)
  console.log('🔍 Header visibility check:', {
    pathname,
    userRole: user?.role,
    isAuthenticated: !!user,
    hideHeader,
    reasons: [
      pathname.startsWith('/login') && 'login page',
      pathname.startsWith('/register') && 'register page',
      pathname.startsWith('/staff/register') && 'staff registration page',
      pathname.startsWith('/dashboard/admin') && 'admin route',
      pathname.startsWith('/dashboard/mechanic') && 'mechanic route',
      user?.role === 'MECHANIC' && 'mechanic role',
      user?.role === 'ADMIN' && pathname === '/dashboard/' && 'admin on main dashboard',
      !user && pathname.startsWith('/dashboard') && 'unauthenticated dashboard'
    ].filter(Boolean)
  });

  if (hideHeader) {
    console.log('🚫 Header hidden for:', pathname, 'User:', user?.role);
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('/')}
              className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              MOTO<span className="text-text">SNAP</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/about')}
              className="text-text hover:text-primary transition-colors font-medium"
            >
              About Us
            </button>
            <button
              onClick={() => user && handleNavigation('/quick-link')}
              disabled={!user}
              className={`${
                user
                  ? 'text-text hover:text-primary transition-colors font-medium cursor-pointer'
                  : 'text-text-muted cursor-not-allowed'
              }`}
            >
              Quick Link
            </button>
            </nav>

          {/* Products Button */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => user && handleNavigation('/dashboard/parts')}
              disabled={!user}
              className={`${
                user
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-muted text-text-muted cursor-not-allowed'
              }`}
            >
              Products
            </Button>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-text hover:text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleNavigation('/about')}
              className="block w-full text-left px-3 py-2 text-text hover:text-primary hover:bg-muted rounded-md font-medium"
            >
              About Us
            </button>
            <button
              onClick={() => user && handleNavigation('/quick-link')}
              disabled={!user}
              className={`${
                user
                  ? 'block w-full text-left px-3 py-2 text-text hover:text-primary hover:bg-muted rounded-md font-medium cursor-pointer'
                  : 'block w-full text-left px-3 py-2 text-text-muted cursor-not-allowed rounded-md font-medium'
              }`}
            >
              Quick Link
            </button>
            </div>
        </div>
      </div>
    </header>
  );
}