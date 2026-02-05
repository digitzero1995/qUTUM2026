'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function AdminPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [lastPoll, setLastPoll] = useState<string | null>(null);
  const [pollResult, setPollResult] = useState<any>(null);
  const [secret, setSecret] = useState('');

  // Only master can access
  if (user?.role !== 'master') {
    return (
      <div className="text-center py-10">
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p>Only master account can access admin panel.</p>
      </div>
    );
  }

  const loadAccounts = async () => {
    if (!secret) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/accounts', {
        headers: { 'x-qa-secret': secret }
      });
      const data = await res.json();
      if (data.ok) {
        setAccounts(data.list || []);
      } else {
        alert('Failed to load accounts: ' + data.message);
      }
    } catch (e) {
      alert('Error: ' + (e as any).message);
    } finally {
      setLoading(false);
    }
  };

  const triggerPoll = async () => {
    setPolling(true);
    try {
      const res = await fetch('/api/alice/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.ok) {
        setPollResult(data);
        setLastPoll(new Date().toLocaleString());
      } else {
        alert('Poll failed: ' + data.message);
      }
    } catch (e) {
      alert('Error: ' + (e as any).message);
    } finally {
      setPolling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage Alice Blue connected accounts and polling</p>
      </div>

      {/* Secret / Auth Section */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Enter your API secret to load accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter x-qa-secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <Button onClick={loadAccounts} disabled={loading || !secret}>
              {loading ? 'Loading...' : 'Load Accounts'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Alice Blue Accounts</CardTitle>
            <CardDescription>{accounts.length} account(s) connected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accounts.map((acc, idx) => (
                <div key={idx} className="border rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{acc.userId}</p>
                    <p className="text-xs text-muted-foreground">{acc.tokenMask}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Connected</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Poll Control */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Polling</CardTitle>
          <CardDescription>Fetch trades from all connected accounts and broadcast to dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={triggerPoll} disabled={polling} size="lg" className="w-full">
            {polling ? '⏳ Polling...' : '▶ Trigger Poll Now'}
          </Button>

          {lastPoll && (
            <div className="text-xs text-muted-foreground">
              Last poll: {lastPoll}
            </div>
          )}

          {pollResult && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded space-y-2">
              <p className="font-medium text-sm">✓ Poll completed</p>
              <p className="text-sm">
                <span className="font-mono">New trades:</span> <span className="font-bold">{pollResult.newTrades || 0}</span>
              </p>
              {pollResult.message && (
                <p className="text-xs text-muted-foreground">{pollResult.message}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            1. Enter your <code className="bg-gray-100 px-2 py-1 rounded text-xs">x-qa-secret</code> to load accounts from <code className="bg-gray-100 px-2 py-1 rounded text-xs">.alice.tokens.json</code>
          </p>
          <p>
            2. Click <strong>Trigger Poll</strong> to fetch trades for all connected accounts from Alice Blue API
          </p>
          <p>
            3. New trades are appended to <code className="bg-gray-100 px-2 py-1 rounded text-xs">.alice.incoming.json</code> and broadcast via SSE to connected dashboards
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            💡 For automation, set up a cron job or scheduler to call <code className="bg-gray-100 px-2 py-1 rounded">POST /api/alice/poll</code> every 5-60 seconds
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
