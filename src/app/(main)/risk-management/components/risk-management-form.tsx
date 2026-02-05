"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FollowerAccount } from "@/lib/data";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAccount } from "@/context/account-context";

interface RiskManagementFormProps {
  account: FollowerAccount;
}

export function RiskManagementForm({ account }: RiskManagementFormProps) {
    const { updateFollowerSettings } = useAccount();
    const [settings, setSettings] = useState({
      riskProfile: account.riskProfile,
      lotMultiplier: account.lotMultiplier,
      perAccountCap: account.perAccountCap,
      dailyLossLimit: account.dailyLossLimit,
      maxExposurePerSymbol: account.maxExposurePerSymbol
    });
    const [isSaving, setIsSaving] = useState(false);

  const [currentPL, setCurrentPL] = useState(account.currentPL);

  useEffect(() => {
    setSettings({
      riskProfile: account.riskProfile,
      lotMultiplier: account.lotMultiplier,
      perAccountCap: account.perAccountCap,
      dailyLossLimit: account.dailyLossLimit,
      maxExposurePerSymbol: account.maxExposurePerSymbol
    });
    setCurrentPL(account.currentPL);
  }, [account]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPL(pl => pl + (Math.random() - 0.5) * 10);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
        updateFollowerSettings(account.id, settings);
        setIsSaving(false);
    }, 1000);
  }

  return (
    <Card className="mt-4 border-none shadow-none">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{account.name} ({account.id})</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Today's P/L</p>
            <p
              className={cn(
                'text-2xl font-bold',
                currentPL >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {currentPL >= 0 ? '+' : ''}₹
              {Math.abs(currentPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label>Risk Profile</Label>
                    <Select 
                        value={settings.riskProfile}
                        onValueChange={(value: FollowerAccount['riskProfile']) => setSettings(s => ({...s, riskProfile: value}))}
                    >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a risk profile" />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Conservative">Conservative</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Pre-defined risk template.</p>
                </div>

                <div className="space-y-2">
                    <Label>Lot Multiplier: {Number(settings.lotMultiplier).toFixed(1)}x</Label>
                      <Slider
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={[settings.lotMultiplier]}
                        onValueChange={([value]) => setSettings(s => ({...s, lotMultiplier: value}))}
                      />
                    <p className="text-sm text-muted-foreground">Multiplier for trade quantity relative to master account.</p>
                </div>
                
                <div className="space-y-2">
                    <Label>Per Account Cap (₹)</Label>
                    <Input type="number" value={settings.perAccountCap} onChange={e => setSettings(s => ({...s, perAccountCap: Number(e.target.value)}))} />
                    <p className="text-sm text-muted-foreground">Maximum capital allocation for this account.</p>
                </div>

                <div className="space-y-2">
                    <Label>Daily Loss Limit (₹)</Label>
                    <Input type="number" value={settings.dailyLossLimit} onChange={e => setSettings(s => ({...s, dailyLossLimit: Number(e.target.value)}))} />
                    <p className="text-sm text-muted-foreground">Trading is halted if this limit is breached.</p>
                </div>

                 <div className="space-y-2">
                    <Label>Max Exposure per Symbol (₹)</Label>
                    <Input type="number" value={settings.maxExposurePerSymbol} onChange={e => setSettings(s => ({...s, maxExposurePerSymbol: Number(e.target.value)}))} />
                     <p className="text-sm text-muted-foreground">Maximum position size for any single stock.</p>
                </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
          </div>
      </CardContent>
    </Card>
  );
}
