'use client';

import { Search, Bell } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function TopHeader({ title, breadcrumb = '워크스페이스' }: TopHeaderProps) {
  return (
    <header className="h-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
        <span className="text-zinc-300">{breadcrumb}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-300" />
        <span className="text-zinc-900">{title}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="검색..."
            className="pl-10 pr-4 py-2 bg-zinc-100 border-none rounded-full text-xs font-medium focus:ring-2 focus:ring-violet-500/20 focus:outline-none w-64 transition-all"
          />
        </div>
        <button className="relative text-zinc-400 hover:text-zinc-900 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 border-2 border-white rounded-full" />
        </button>
        <div className="w-10 h-10 rounded-full border border-zinc-200 bg-zinc-100 p-0.5">
          <div className="w-full h-full rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
