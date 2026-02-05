"use client";

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TradesTableProps {
  showAccount?: boolean;
}

type RemoteTrade = {
  id: string;
  timestamp: string;
  account: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  tradedQty: number;
  price: number;
  status: string;
}

export function TradesTable({ showAccount = true }: TradesTableProps) {
  const [loading, setLoading] = useState(true);
  const [masterTrades, setMasterTrades] = useState<RemoteTrade[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Filled':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Partial Fill':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:red-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const fetchTrades = async () => {
    setLoading(true);
    setError(null);
    try {
      // We only display trades pushed by the extension (incoming)
      const res = await fetch('/api/alice/incoming');
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const payload = await res.json().catch(() => ({}));
      const incoming = payload.trades ?? [];

      const mapped = incoming.map((t: any) => {
        const id = t.id || `${t.account || 'A'}-${t.timestamp}-${Math.random()}`;
        const trade: RemoteTrade = {
          id,
          timestamp: t.timestamp || new Date().toISOString(),
          account: t.account || (t.accountName || 'Master'),
          symbol: t.symbol || t.instrument || t.scrip || '',
          type: t.type || (t.product || 'Market'),
          side: t.side || t.buySell || 'Buy',
          quantity: Number(t.quantity ?? t.qty ?? 0),
          tradedQty: Number(t.tradedQty ?? t.filledQty ?? t.qty ?? 0),
          price: Number(t.price ?? t.fillPrice ?? 0),
          status: t.status || 'Filled',
        };
        return trade;
      });

      const sorted = mapped.sort((a: RemoteTrade, b: RemoteTrade) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMasterTrades(sorted);
    } catch (e: any) {
      console.error('Failed to fetch trades', e);
      setError(e?.message ?? 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load initial trades only (manual refresh controls the rest)
    fetchTrades();

    // No SSE or polling: user requested manual refresh only
    return () => {};
  }, []);

  function formatTime(ts: string) {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString();
    } catch (e) {
      return '';
    }
  }

  return (
    <div className="w-full overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => fetchTrades()}>Refresh</Button>
          <Button variant="destructive" size="sm" onClick={async () => {
            if (!confirm('Remove all master incoming trades? This cannot be undone.')) return;
            try {
              await fetch('/api/alice/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: 'TESTMASTER' }) });
              fetchTrades();
            } catch (e) {
              console.error('Failed to clear trades', e);
            }
          }}>Clear All Trades</Button>
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={async () => {
            // Remove only dummy QA-TEST trades across accounts
            try {
              const res = await fetch('/api/alice/incoming');
              const payload = await res.json().catch(() => ({}));
              const trades = payload.trades || [];
              const grouped: Record<string, string[]> = {};
              trades.forEach((t: any) => {
                const id = t.id || '';
                if (id.startsWith('QA-TEST')) {
                  const acc = t.account || 'TESTMASTER';
                  grouped[acc] = grouped[acc] || [];
                  grouped[acc].push(id);
                }
              });

              const entries = Object.entries(grouped);
              if (entries.length === 0) {
                alert('No dummy QA-TEST trades found');
                return;
              }

              if (!confirm(`Remove ${entries.reduce((s,[_k,v])=>s+v.length,0)} dummy trades?`)) return;

              for (const [acc, ids] of entries) {
                await fetch('/api/alice/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: acc, tradeIds: ids }) });
              }

              fetchTrades();
            } catch (e) {
              console.error('Failed to clear dummy trades', e);
            }
          }}>Clear Dummy Trades</Button>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">Error loading trades: {error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Instrument</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Traded Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {masterTrades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showAccount ? 8 : 7} className="h-24 text-center">
                  No trades found for the master account today.
                </TableCell>
              </TableRow>
            ) : (
              masterTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="whitespace-nowrap">{formatTime(trade.timestamp)}</TableCell>
                  <TableCell>
                    <span className={trade.side === 'Buy' ? 'inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-sm' : 'inline-block bg-red-100 text-red-800 px-3 py-1 rounded text-sm'}>
                      {trade.side}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{trade.type}</TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right">{trade.tradedQty}</TableCell>
                  <TableCell className="text-right">{`₹${trade.price.toFixed(2)}`}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="destructive" size="sm" onClick={async () => {
                      if (!confirm('Remove this trade?')) return;
                      try {
                        await fetch('/api/alice/remove', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountId: trade.account || 'TESTMASTER', tradeIds: [trade.id] }) });
                        fetchTrades();
                      } catch (e) {
                        console.error('Failed to remove trade', e);
                      }
                    }}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
