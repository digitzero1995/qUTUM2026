"use client";

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from '@/context/account-context';
import { RiskManagementForm } from './components/risk-management-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RiskManagementPage() {
  const searchParams = useSearchParams();
  const { followerAccounts } = useAccount();

  if (followerAccounts.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>No Follower Accounts</CardTitle>
                  <CardDescription>
                      You need to add at least one follower account to manage risk settings.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                    <Link href="/configuration">Add an Account</Link>
                </Button>
              </CardContent>
          </Card>
      )
  }

  const accountParam = searchParams.get('account');
  const validAccountIds = new Set(followerAccounts.map(a => a.id));
  const defaultTab = (accountParam && validAccountIds.has(accountParam)) ? accountParam : followerAccounts[0].id;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Management</CardTitle>
        <CardDescription>
          Configure risk parameters for each follower account. Changes are applied in real time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-${followerAccounts.length > 0 ? Math.min(followerAccounts.length, 4) : 1}`}>
            {followerAccounts.map((account) => (
              <TabsTrigger key={account.id} value={account.id}>
                {account.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {followerAccounts.map((account) => (
            <TabsContent key={account.id} value={account.id}>
              <RiskManagementForm account={account} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
