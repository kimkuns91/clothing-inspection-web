'use client';

import { cn } from '@/lib/utils';

interface FilterTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

export function FilterTabs<T extends string>({ value, onChange, options }: FilterTabsProps<T>) {
  return (
    <div className="flex p-1 bg-zinc-200/50 rounded-xl">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-6 py-2.5 text-xs font-bold rounded-lg transition-all',
            value === option.value
              ? 'bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200'
              : 'text-zinc-400 hover:text-zinc-600'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
