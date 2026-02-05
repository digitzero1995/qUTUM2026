"use client";

import { useAuth } from '@/context/auth-context';
import { MasterDashboard } from './components/master-dashboard';
import { FollowerDashboard } from './components/follower-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, loading } = useAuth();

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

  if (user.role === 'master') {
    return <MasterDashboard />;
  }

  return <FollowerDashboard />;
}
