import { ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatBoxProps {
  label: string;
  value: string | number;
  secondary: string;
  highlight?: string;
  icon?: React.ReactNode;
}

export function StatBox({ label, value, secondary, highlight, icon }: StatBoxProps) {
  return (
    <div className="bg-white p-6 rounded-[28px] border border-zinc-200 shadow-sm relative overflow-hidden group hover:border-violet-200 transition-colors">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-125 transition-transform">
        {icon || <Sparkles size={40} className="text-violet-600" />}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
          {label}
        </span>
        <div className="flex items-baseline gap-2 mb-4">
          <h4 className={cn('text-4xl font-bold tracking-tighter', highlight || 'text-zinc-900')}>
            {value}
          </h4>
          <ArrowUpRight size={16} className="text-zinc-300" />
        </div>
        <div className="pt-4 border-t border-zinc-50 flex items-center justify-between">
          <span className="text-[11px] font-medium text-zinc-500">{secondary}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
