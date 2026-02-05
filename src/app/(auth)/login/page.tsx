"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* full-width responsive background image fixed to viewport */}
      <img src="/home-banner.jpg" alt="Home banner" className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none" aria-hidden="true" />
      {/* subtle dark overlay for contrast (fixed to viewport) */}
      <div className="fixed inset-0 bg-black/40" aria-hidden />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md md:max-w-lg p-6">
          <Card className="bg-white text-black shadow-lg">
              <CardHeader className="text-center">
                  <div className="flex justify-center items-center gap-2 mb-2">
                      <Logo />
                      <CardTitle className="text-3xl !mt-0 text-black">QuantumAlphaIn</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    Enter your credentials to access your dashboard
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleLogin} className="grid gap-4">
                      <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                          id="username"
                          type="text"
                          placeholder="master or follower username"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isLoading}
                      />
                      </div>
                      <div className="grid gap-2">
                      <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                      </div>
                      <Input 
                          id="password" 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                      />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Signing In...' : 'Sign In'}
                      </Button>
                  </form>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
