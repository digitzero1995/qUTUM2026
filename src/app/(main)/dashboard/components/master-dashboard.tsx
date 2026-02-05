'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { TradesTable } from './trades-table';
import { useAccount } from '@/context/account-context';
import { FollowerCard } from './follower-card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

export function MasterDashboard() {
  const { followerAccounts } = useAccount();
  const previewCount = 6;

  return (
    <div className="flex flex-col gap-6">
      {/* Trades on top */}
      <Card>
        <CardHeader>
          <CardTitle>Alice Blue Master Trades</CardTitle>
          <CardDescription>
            This table displays a real-time feed of trades from the master
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TradesTable />
        </CardContent>
      </Card>
      {/* Followers management moved to Configuration > Followers */}
      <Card>
        <CardHeader>
          <CardTitle>Followers</CardTitle>
          <CardDescription>
            To manage follower accounts and their trades, open the Manage Followers page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end">
            <Button asChild>
              <Link href="/configuration">Manage Followers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
