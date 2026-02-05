"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/context/account-context';
import { useToast } from '@/hooks/use-toast';
import type { FollowerAccount } from '@/lib/data';

// Define the shape of the user object
interface User {
  id: string;
  role: 'master' | 'follower';
  name: string;
}

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Master user credentials (should be in an environment variable in a real app)
const MASTER_USERNAME = 'master';
const MASTER_PASSWORD = 'password';

// Create the provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  // We need to get follower accounts from the account context to check credentials
  const { followerAccounts } = useAccount();


  useEffect(() => {
    // Check if user is logged in from localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    let loggedInUser: User | null = null;
    
    if (username.toLowerCase() === MASTER_USERNAME && password === MASTER_PASSWORD) {
      loggedInUser = { id: 'master', role: 'master', name: 'Alice Blue Master' };
    } else {
      // It's important to use the live followerAccounts from the context
      const followerAccount = followerAccounts.find(
        (acc: FollowerAccount) => acc.username.toLowerCase() === username.toLowerCase() && acc.password === password
      );
      if (followerAccount) {
        loggedInUser = { id: followerAccount.id, role: 'follower', name: followerAccount.name };
      }
    }

    if (loggedInUser) {
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.name}!` });
      router.push('/dashboard');
      return true;
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid username or password.' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/login');
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
