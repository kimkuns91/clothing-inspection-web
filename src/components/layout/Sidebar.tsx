'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Activity, Layers, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/reviews', label: '검수 목록', icon: LayoutGrid },
  { href: '/dashboard', label: '통계', icon: Activity },
  { href: '/history', label: '히스토리', icon: Layers },
  { href: '/settings', label: '설정', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 border-r border-zinc-200 bg-white flex flex-col items-center lg:items-stretch py-8 transition-all duration-300 z-50 shrink-0 sticky top-0 h-screen overflow-y-auto">
      <div className="px-6 mb-12 flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h1 className="hidden lg:block text-lg font-bold tracking-tight text-zinc-900 uppercase">
          Inspector<span className="text-violet-600">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group',
                isActive
                  ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              )}
            >
              <span className={isActive ? 'text-violet-400' : 'text-zinc-400 group-hover:text-zinc-600'}>
                <Icon size={20} />
              </span>
              <span className="hidden lg:block">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 hidden lg:block" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="p-4 bg-zinc-900 rounded-2xl hidden lg:block overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-1 opacity-20 group-hover:scale-125 transition-transform">
            <Sparkles size={40} className="text-white" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">상태</p>
          <p className="text-white text-sm font-semibold mb-3">AI 엔진 온라인</p>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-violet-500 w-3/4 h-full rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  );
}
