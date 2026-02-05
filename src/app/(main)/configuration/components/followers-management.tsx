"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccount } from '@/context/account-context';
import { format } from 'date-fns';

export function FollowersManagement() {
  const { followerAccounts, followerTrades, removeFollower, removeFollowerTrade, clearFollowerTrades, updateFollowerSettings, addFollowerTrade } = useAccount() as any;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Followers</h3>
      <div className="grid gap-4">
        {followerAccounts.map((acc: any) => (
          <FollowerCardDetailed
            key={acc.id}
            acc={acc}
            trades={followerTrades[acc.id] || []}
            removeFollower={removeFollower}
            removeFollowerTrade={removeFollowerTrade}
            clearFollowerTrades={clearFollowerTrades}
            updateFollowerSettings={updateFollowerSettings}
            addFollowerTrade={addFollowerTrade}
          />
        ))}
      </div>
    </div>
  );
}

function computePnL(trades: any[], quotes: Record<string, number>) {
  // Calculate P/L using current prices from quotes
  let pnl = 0;
  trades.forEach(t => {
    const currentPrice = quotes[t.symbol] || t.price;
    const priceChange = currentPrice - Number(t.price || 0);
    const sign = t.side === 'Buy' ? 1 : -1;
    pnl += sign * (Number(t.quantity || 0) * priceChange);
  });
  return pnl;
}

export function FollowerCardDetailed({ acc, trades, removeFollower, removeFollowerTrade, clearFollowerTrades, updateFollowerSettings, addFollowerTrade }: any) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    lotMultiplier: acc.lotMultiplier ?? 1,
    perAccountCap: acc.perAccountCap ?? 100000,
    dailyLossLimit: acc.dailyLossLimit ?? 5000,
    maxExposurePerSymbol: acc.maxExposurePerSymbol ?? 25000,
    initialBalance: acc.initialBalance ?? 0,
  });

  const [niftyInstruments, setNiftyInstruments] = useState<any[]>([]);
  const [tradeForm, setTradeForm] = useState({ selectedSymbol: '', side: 'Buy', quantity: '' });
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Fetch NIFTY quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      setLoadingQuotes(true);
      try {
        const res = await fetch('/api/nifty/quotes');
        if (res.ok) {
          const data = await res.json();
          setNiftyInstruments(data.instruments);
        }
      } catch (e) {
        console.error('Failed to fetch NIFTY quotes', e);
      } finally {
        setLoadingQuotes(false);
      }
    };
    fetchQuotes();
    // Refresh quotes every 5 seconds
    const interval = setInterval(fetchQuotes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Build quote map for P/L calculation
  const quoteMap = useMemo(() => {
    const map: Record<string, number> = {};
    niftyInstruments.forEach(inst => {
      map[inst.symbol] = inst.currentPrice;
    });
    return map;
  }, [niftyInstruments]);

  const pnl = useMemo(() => computePnL(trades, quoteMap), [trades, quoteMap]);

  const handleSave = () => {
    updateFollowerSettings(acc.id, {
      lotMultiplier: Number(form.lotMultiplier),
      perAccountCap: Number(form.perAccountCap),
      dailyLossLimit: Number(form.dailyLossLimit),
      maxExposurePerSymbol: Number(form.maxExposurePerSymbol),
      initialBalance: Number(form.initialBalance),
    });
    setEditing(false);
  };

  const handleAddTrade = () => {
    if (!tradeForm.selectedSymbol || !tradeForm.quantity) return;
    const selectedInst = niftyInstruments.find(i => i.symbol === tradeForm.selectedSymbol);
    if (!selectedInst) return;
    addFollowerTrade(acc.id, {
      symbol: selectedInst.symbol,
      side: tradeForm.side as 'Buy' | 'Sell',
      quantity: Number(tradeForm.quantity),
      price: selectedInst.currentPrice,
    });
    setTradeForm({ selectedSymbol: '', side: 'Buy', quantity: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <CardTitle className="flex items-center gap-2">{acc.name} <span className="text-sm text-muted-foreground">{acc.id}</span></CardTitle>
            <div className="text-sm text-muted-foreground">Initial: ₹{Number(acc.initialBalance).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-sm">Today's P/L</div>
            <div className={pnl >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>₹{pnl.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Lot Multiplier</div>
            <div className="font-medium">{acc.lotMultiplier}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Max Exposure / Symbol</div>
            <div className="font-medium">₹{Number(acc.maxExposurePerSymbol).toLocaleString()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Daily Loss Limit</div>
            <div className="font-medium">₹{Number(acc.dailyLossLimit).toLocaleString()}</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Add NIFTY Trade (from live prices)</h4>
          <div className="flex gap-2 flex-wrap">
            <select 
              value={tradeForm.selectedSymbol} 
              onChange={(e) => setTradeForm(prev => ({...prev, selectedSymbol: e.target.value}))} 
              className="border rounded px-2 py-1 text-sm"
              disabled={loadingQuotes}
            >
              <option value="">{loadingQuotes ? 'Loading...' : 'Select NIFTY'}</option>
              {niftyInstruments.map(inst => (
                <option key={inst.symbol} value={inst.symbol}>
                  {inst.name} (₹{inst.currentPrice.toFixed(2)})
                </option>
              ))}
            </select>
            <select value={tradeForm.side} onChange={(e) => setTradeForm(prev => ({...prev, side: e.target.value}))} className="border rounded px-2 py-1 text-sm">
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
            <input type="number" className="border rounded px-2 py-1 text-sm" placeholder="Qty" value={tradeForm.quantity} onChange={(e) => setTradeForm(prev => ({...prev, quantity: e.target.value}))} />
            <Button onClick={handleAddTrade} disabled={loadingQuotes || !tradeForm.selectedSymbol || !tradeForm.quantity}>Add Trade</Button>
          </div>
        </div>

        <div className="w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Entry</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Trade P/L</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-20 text-center">No trades for this follower.</TableCell>
                </TableRow>
              ) : (
                trades.map((t: any) => {
                  const currentPrice = quoteMap[t.symbol] || t.price;
                  const pnlPerUnit = t.side === 'Buy' ? currentPrice - t.price : t.price - currentPrice;
                  const tradePnl = pnlPerUnit * t.quantity;
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{format(new Date(t.timestamp), 'HH:mm:ss')}</TableCell>
                      <TableCell className="font-medium">{t.symbol}</TableCell>
                      <TableCell className={t.side === 'Buy' ? 'text-green-600' : 'text-red-600'}>{t.side}</TableCell>
                      <TableCell className="text-right">{t.quantity}</TableCell>
                      <TableCell className="text-right">₹{t.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">₹{currentPrice.toFixed(2)}</TableCell>
                      <TableCell className={`text-right font-medium ${tradePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{tradePnl.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="destructive" size="sm" onClick={() => removeFollowerTrade(acc.id, t.id)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit Settings'}</Button>
          {editing && (
            <div className="flex items-center gap-2">
              <input className="input" type="number" value={form.lotMultiplier} onChange={(e) => setForm(prev => ({...prev, lotMultiplier: e.target.value}))} placeholder="Lot x" />
              <input className="input" type="number" value={form.dailyLossLimit} onChange={(e) => setForm(prev => ({...prev, dailyLossLimit: e.target.value}))} placeholder="Daily Loss" />
              <input className="input" type="number" value={form.maxExposurePerSymbol} onChange={(e) => setForm(prev => ({...prev, maxExposurePerSymbol: e.target.value}))} placeholder="Max Exposure" />
              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
        <div>
          <Button variant="outline" size="sm" onClick={() => clearFollowerTrades(acc.id)}>Clear Trades</Button>
        </div>
      </CardFooter>
    </Card>
  );
}
