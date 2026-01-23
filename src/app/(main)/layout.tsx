'use client';

import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FB]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
