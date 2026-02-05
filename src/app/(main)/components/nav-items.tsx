"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Settings,
  FileText,
  BookOpen,
  Database,
} from 'lucide-react';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/auth-context';

export function NavItems() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname.startsWith('/dashboard')}>
          <Link href="/dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {user?.role === 'master' && (
        <>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Risk Management" isActive={pathname.startsWith('/risk-management')}>
              <Link href="/risk-management">
                <ShieldCheck />
                <span>Risk Management</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Configuration" isActive={pathname.startsWith('/configuration')}>
              <Link href="/configuration">
                <Settings />
                <span>Configuration</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Admin" isActive={pathname.startsWith('/admin')}>
              <Link href="/admin">
                <Database />
                <span>Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      )}
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Logs" isActive={pathname.startsWith('/logs')}>
          <Link href="/logs">
            <FileText />
            <span>Logs</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

       <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Overview" isActive={pathname.startsWith('/overview')}>
          <Link href="/overview">
            <BookOpen />
            <span>Overview</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
}
