"use client";

import { AccountProvider } from "@/context/account-context";
import { AuthProvider } from "@/context/auth-context";
import React from "react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AccountProvider>
  );
}
