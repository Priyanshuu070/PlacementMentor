"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { open } = useSidebar();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'All Interviews', href: '/all-interviews', icon: '📝' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'Billing', href: '/billing', icon: '💳' },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-gray-50 border-r border-gray-200 transition-all duration-200",
        open ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">PlacementMentor</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
