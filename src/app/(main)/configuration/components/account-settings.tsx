"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount } from "@/context/account-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Info, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function AddFollowerDialog() {
    const { addAccount } = useAccount();
    const { toast } = useToast();
    const [accountType, setAccountType] = useState('Follower');
    const [accountId, setAccountId] = useState('');
    const [accountName, setAccountName] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [initialBalance, setInitialBalance] = useState('');
    const [lotMultiplier, setLotMultiplier] = useState('1');
    
    const [open, setOpen] = useState(false);
    const [newCreds, setNewCreds] = useState<{username: string, password: string} | null>(null);

    const handleAddFollower = () => {
        const balance = parseFloat(initialBalance);
        const multiplier = parseFloat(lotMultiplier);

        if (!accountId || !accountName || !initialBalance || isNaN(balance) || !lotMultiplier || isNaN(multiplier)) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please fill out all required fields with valid information.',
            });
            return;
        }

        const result = addAccount({ 
            id: accountId, 
            name: accountName, 
            telegramId: telegramId || undefined, 
            initialBalance: balance,
            lotMultiplier: multiplier,
        }, accountType as 'Follower' | 'Master');

        if (result.success && result.username && result.password) {
            setNewCreds({ username: result.username, password: result.password });
            setAccountId('');
            setAccountName('');
            setTelegramId('');
            setInitialBalance('');
            setLotMultiplier('1');
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "Credentials copied to clipboard." });
    }

    const resetAndClose = () => {
        setNewCreds(null);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
             <Card className="border-dashed flex items-center justify-center hover:border-primary transition-colors cursor-pointer min-h-[260px]">
                <div className="text-center text-muted-foreground">
                    <PlusCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">Add New Account</h3>
                    <p className="mt-1 text-sm">Create a new follower profile</p>
                </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" onInteractOutside={(e) => {
              if(newCreds) e.preventDefault();
          }}>
            {!newCreds ? (
                <>
                    <DialogHeader>
                      <DialogTitle>Add New Account</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new master or follower account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                        <Label htmlFor="account-type">Account Type</Label>
                        <Select value={accountType} onValueChange={setAccountType}>
                          <SelectTrigger id="account-type">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Follower">Follower</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-id">Account ID</Label>
                        <Input id="account-id" value={accountId} onChange={(e) => setAccountId(e.target.value.toUpperCase())} placeholder="e.g., ZERODHA-123" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input id="account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g., My Trading Account" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telegram-id">Telegram ID (Optional)</Label>
                        <Input id="telegram-id" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} placeholder="@username" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="balance">Initial Balance (₹)</Label>
                        <Input id="balance" type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} placeholder="e.g., 10000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lot-multiplier">Lot Multiplier</Label>
                        <Input id="lot-multiplier" type="number" value={lotMultiplier} onChange={(e) => setLotMultiplier(e.target.value)} placeholder="e.g., 1" step="0.1" />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleAddFollower}>Add Account</Button>
                    </DialogFooter>
                </>
            ) : (
                <>
                    <DialogHeader>
                      <DialogTitle>Account Created Successfully!</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Info className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                    Please save these credentials securely. You will not be able to see them again.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="flex items-center gap-2">
                                <Input value={newCreds.username} readOnly />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(newCreds.username)}><Copy className="h-4 w-4"/></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="flex items-center gap-2">
                                <Input value={newCreds.password} readOnly />
                                <Button variant="outline" size="icon" onClick={() => copyToClipboard(newCreds.password)}><Copy className="h-4 w-4"/></Button>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button onClick={resetAndClose}>I have saved the credentials</Button>
                    </DialogFooter>
                </>
            )}
          </DialogContent>
        </Dialog>
    )
}

export function AccountSettings() {
  const { followerAccounts, masterAccounts, removeFollower, removeMaster } = useAccount() as any;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Follower Accounts</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {masterAccounts?.map((account: any) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle>{account.name}</CardTitle>
                <CardDescription>
                  {account.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-mono">{account.username}</span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Balance:</span>
                      <span>₹{account.initialBalance.toLocaleString()}</span>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <Button onClick={() => { window.location.href = `/api/alice/oauth/start?accountId=${encodeURIComponent(account.id)}`; }}>Connect</Button>
                </div>
                <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Remove</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the account
                        for {account.name} and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeMaster(account.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
          {followerAccounts.map((account: any) => (
            <Card key={account.id}>
              <CardHeader>
                <CardTitle>{account.name}</CardTitle>
                <CardDescription>
                  {account.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Username:</span>
                      <span className="font-mono">{account.username}</span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Balance:</span>
                      <span>₹{account.initialBalance.toLocaleString()}</span>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Remove</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the account
                        for {account.name} and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeFollower(account.id)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
          <AddFollowerDialog />
        </div>
      </div>
    </div>
  );
}
