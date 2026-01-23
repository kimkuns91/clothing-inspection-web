import { cn } from '@/lib/utils';

interface GradeBadgeProps {
  grade: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const themes: Record<string, string> = {
  S: 'bg-violet-50 text-violet-700 border-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.1)]',
  A: 'bg-blue-50 text-blue-700 border-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.1)]',
  B: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
  F: 'bg-rose-50 text-rose-700 border-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.1)]',
};

const sizes = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-[13px]',
  lg: 'w-12 h-12 text-xl',
};

export function GradeBadge({ grade, size = 'md' }: GradeBadgeProps) {
  if (!grade) {
    return (
      <span className="text-zinc-300 font-medium text-xs tracking-tighter">
        UNSET
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-bold tracking-tight transition-all duration-300',
        sizes[size],
        themes[grade] || 'bg-zinc-50 text-zinc-500 border-zinc-200'
      )}
    >
      {grade}
    </span>
  );
}
