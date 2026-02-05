"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const masterOnlyRoutes = ['/risk-management', '/configuration'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // If no user, redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // If follower tries to access master-only route, redirect to their dashboard
    if (user.role === 'follower' && masterOnlyRoutes.some(route => pathname.startsWith(route))) {
      router.replace('/dashboard');
    }
    
  }, [user, loading, router, pathname]);

  // Show a loading skeleton while we verify the user
  if (loading || !user) {
     return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    );
  }

  // If user is authenticated and authorized, render the children
  return <>{children}</>;
}
