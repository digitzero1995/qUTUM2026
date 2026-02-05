import React from 'react';
import Link from 'next/link';
import { Home, List, FileText, Settings, BarChart2 } from 'lucide-react';

export function Footer() {
  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden rounded-xl bg-card/90 backdrop-blur-md shadow-lg p-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <ul className="grid grid-cols-5 gap-0 items-center">
          <li className="text-center">
            <Link href="/dashboard" className="flex flex-col items-center justify-center text-sm text-muted-foreground w-full py-1">
              <Home className="h-4 w-4 mb-0.5" />
              <span className="text-[11px]">Home</span>
            </Link>
          </li>
          <li className="text-center">
            <Link href="/overview" className="flex flex-col items-center justify-center text-sm text-muted-foreground w-full py-1">
              <BarChart2 className="h-4 w-4 mb-0.5" />
              <span className="text-[11px]">Overview</span>
            </Link>
          </li>
          <li className="text-center">
            <Link href="/logs" className="flex flex-col items-center justify-center text-sm text-muted-foreground w-full py-1">
              <FileText className="h-4 w-4 mb-0.5" />
              <span className="text-[11px]">Logs</span>
            </Link>
          </li>
          <li className="text-center">
            <Link href="/configuration" className="flex flex-col items-center justify-center text-sm text-muted-foreground w-full py-1">
              <List className="h-4 w-4 mb-0.5" />
              <span className="text-[11px]">Config</span>
            </Link>
          </li>
          <li className="text-center">
            <Link href="/" className="flex flex-col items-center justify-center text-sm text-muted-foreground w-full py-1">
              <Settings className="h-4 w-4 mb-0.5" />
              <span className="text-[11px]">More</span>
            </Link>
          </li>
        </ul>
      </nav>


    </>
  );
}
