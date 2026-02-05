"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/context/account-context';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';


interface FollowerTradesTableProps {
  followerId: string;
}

export function FollowerTradesTable({ followerId }: FollowerTradesTableProps) {
  const { followerTrades } = useAccount();
  const trades = followerTrades[followerId] || [];

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.length === 0 ? (
             <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    You haven't placed any trades yet.
                </TableCell>
             </TableRow>
          ) : (
            trades.map((trade) => (
                <TableRow key={trade.id}>
                <TableCell>{format(new Date(trade.timestamp), 'HH:mm:ss')}</TableCell>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell className={cn(trade.side === 'Buy' ? 'text-green-600' : 'text-red-600')}>
                    {trade.side}
                </TableCell>
                <TableCell className="text-right">{trade.quantity}</TableCell>
                <TableCell className="text-right">₹{trade.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{(trade.quantity * trade.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
