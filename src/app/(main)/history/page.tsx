'use client';

import { TopHeader } from '@/components/layout/TopHeader';
import { Layers } from 'lucide-react';

export default function HistoryPage() {
  return (
    <>
      <TopHeader title="히스토리" />

      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
            <Layers className="text-zinc-300" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">히스토리</h2>
          <p className="text-zinc-500 text-sm text-center max-w-md">
            검수 히스토리 기능은 준비중입니다.
          </p>
        </div>
      </div>
    </>
  );
}
