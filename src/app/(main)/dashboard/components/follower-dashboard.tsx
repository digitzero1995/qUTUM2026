'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TradesTable } from './trades-table';
import { useAccount } from '@/context/account-context';
import { FollowerPortfolioSummary } from './follower-portfolio-summary';
import { FollowerTradesTable } from './follower-trades-table';
import { useToast } from '@/hooks/use-toast';

export function FollowerDashboard() {
  const { user } = useAuth();
  const { addFollowerTrade } = useAccount();
  const { toast } = useToast();
  const [isAddTradeOpen, setAddTradeOpen] = useState(false);

  const [tradeDetails, setTradeDetails] = useState<{ symbol: string; side: 'Buy' | 'Sell'; quantity: string; price: string }>({
    symbol: '',
    side: 'Buy',
    quantity: '',
    price: '',
  });

  const handleAddTrade = () => {
    if (!user || !tradeDetails.symbol || !tradeDetails.quantity || !tradeDetails.price) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please fill out all trade details.',
        });
        return;
    }

    addFollowerTrade(user.id, {
        ...tradeDetails,
        quantity: parseInt(tradeDetails.quantity, 10),
        price: parseFloat(tradeDetails.price),
    });
    
    toast({
        title: 'Trade Added',
        description: `Your trade for ${tradeDetails.symbol} has been logged.`,
    });

    // Reset form and close dialog
    setTradeDetails({ symbol: '', side: 'Buy', quantity: '', price: '' });
    setAddTradeOpen(false);
  };


  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Follower's Own Section */}
      <div className="border-b pb-6">
        <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
        <FollowerPortfolioSummary followerId={user.id} />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Trades</CardTitle>
              <CardDescription>
                A log of all trades you have manually placed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Dialog open={isAddTradeOpen} onOpenChange={setAddTradeOpen}>
                  <DialogTrigger asChild>
                    <Button>Add Trade</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Manual Trade</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="symbol">Symbol</Label>
                        <Input id="symbol" value={tradeDetails.symbol} onChange={(e) => setTradeDetails(prev => ({...prev, symbol: e.target.value.toUpperCase()}))} placeholder="e.g., RELIANCE" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="side">Side</Label>
                        <Select value={tradeDetails.side} onValueChange={(value: 'Buy' | 'Sell') => setTradeDetails(prev => ({...prev, side: value}))}>
                          <SelectTrigger id="side">
                            <SelectValue placeholder="Select side" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Buy">Buy</SelectItem>
                            <SelectItem value="Sell">Sell</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={tradeDetails.quantity} onChange={(e) => setTradeDetails(prev => ({...prev, quantity: e.target.value}))} placeholder="e.g., 100" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" value={tradeDetails.price} onChange={(e) => setTradeDetails(prev => ({...prev, price: e.target.value}))} placeholder="e.g., 2850.50" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAddTrade}>Add Trade</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <FollowerTradesTable followerId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Master's Dashboard Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Master Account Dashboard</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Monitor the master account's performance and latest trades. Follow these trade calls on your broker.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Master Account Trade Calls</CardTitle>
            <CardDescription>
              These are the latest trades from the master account. You can execute them on your own broker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TradesTable showAccount={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
