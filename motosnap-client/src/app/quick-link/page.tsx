'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function QuickLinkPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to products page
    router.push('/dashboard/parts');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-muted">Redirecting to products...</p>
      </div>
    </div>
  );
}