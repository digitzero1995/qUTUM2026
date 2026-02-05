"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "@/context/account-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FollowerPortfolioSummaryProps {
    followerId: string;
}

export function FollowerPortfolioSummary({ followerId }: FollowerPortfolioSummaryProps) {
    const { followerAccounts } = useAccount();
    const account = followerAccounts.find(acc => acc.id === followerId);
    
    // Simulate real-time P/L fluctuations
    const [currentPL, setCurrentPL] = useState(account?.currentPL ?? 0);

    useEffect(() => {
        const interval = setInterval(() => {
          setCurrentPL(pl => pl + (Math.random() - 0.5) * 15);
        }, 2500);
        return () => clearInterval(interval);
    }, []);


    if (!account) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not find account details.</p>
                </CardContent>
            </Card>
        )
    }

    const equity = account.initialBalance + currentPL;

    return (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's P/L</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", currentPL >= 0 ? "text-green-600" : "text-red-600")}>
                {currentPL >= 0 ? '+' : ''}₹{Math.abs(currentPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in real-time
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Initial Balance</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{account.initialBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
               <p className="text-xs text-muted-foreground">
                Your starting capital
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Equity</CardTitle>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
               <p className="text-xs text-muted-foreground">
                Initial Balance + P/L
              </p>
            </CardContent>
          </Card>
        </div>
    )

}
