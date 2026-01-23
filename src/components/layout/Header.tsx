'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/reviews', label: '리뷰 목록', icon: ClipboardList },
    { href: '/dashboard', label: '대시보드', icon: BarChart3 },
  ];

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/reviews" className="text-xl font-bold">
            의류 검수 비교 시스템
          </Link>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
