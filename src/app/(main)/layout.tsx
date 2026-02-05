"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { NavItems } from './components/nav-items';
import { useAuth } from '@/context/auth-context';
import { AuthGuard } from '@/components/auth-guard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  
  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo />
              <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">QuantumAlphaIn</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <NavItems />
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2">
            {/* Footer content if any */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 sm:h-14 items-center gap-3 sm:gap-4 border-b bg-card px-3 sm:px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
              {/* Can add a global search here if needed */}
            </div>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={user?.name} />}
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                <DropdownMenuItem disabled>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-24 md:pb-6 container">
            <AuthGuard>{children}</AuthGuard>
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
