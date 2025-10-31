'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MAINTENANCE_MODE } from '@/config/maintenance';

interface MaintenanceGateProps {
  children: React.ReactNode;
}

export default function MaintenanceGate({ children }: MaintenanceGateProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If maintenance mode is active and user is not on maintenance page, redirect
    if (MAINTENANCE_MODE && pathname !== '/maintenance') {
      router.replace('/maintenance');
    }

    // If maintenance mode is NOT active and user is on maintenance page, redirect to home
    if (!MAINTENANCE_MODE && pathname === '/maintenance') {
      router.replace('/');
    }
  }, [pathname, router]);

  // If maintenance mode is active and not on maintenance page, show nothing (will redirect)
  if (MAINTENANCE_MODE && pathname !== '/maintenance') {
    return null;
  }

  // Show children only when not in maintenance mode or when on maintenance page
  return <>{children}</>;
}