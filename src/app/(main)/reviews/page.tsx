'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useReviews } from '@/hooks/useReviews';
import { TopHeader } from '@/components/layout/TopHeader';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { StatBox } from '@/components/ui/StatBox';
import { FilterTabs } from '@/components/ui/FilterTabs';
import { Loader2, CheckCircle, XCircle, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

type FilterType = 'all' | 'pending' | 'reviewed';

const filterOptions = [
  { value: 'all' as const, label: '전체' },
  { value: 'pending' as const, label: '대기중' },
  { value: 'reviewed' as const, label: '완료' },
];

export default function ReviewsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);
  const limit = 10;

  const reviewedParam = filter === 'all' ? undefined : filter === 'reviewed';

  const { data, isLoading, error } = useReviews({
    reviewed: reviewedParam,
    limit,
    offset: page * limit,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR');
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('ko-KR').format(price) + ' KRW';
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(0);
  };

  return (
    <>
      <TopHeader title="검수 대시보드" />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
              검수 관리
            </h2>
            <p className="text-zinc-500 text-sm">
              AI 검수 결과를 모니터링하고 전문가 검증을 수행합니다.
            </p>
          </div>
          <FilterTabs
            value={filter}
            onChange={handleFilterChange}
            options={filterOptions}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox
            label="전체 검수"
            value={data?.total ?? 0}
            secondary="총 검수 건수"
          />
          <StatBox
            label="대기중"
            value={data?.pending_count ?? 0}
            secondary="검증 필요"
            highlight="text-violet-600"
          />
          <StatBox
            label="완료"
            value={data?.reviewed_count ?? 0}
            secondary="검증 완료"
            highlight="text-emerald-600"
          />
          <StatBox
            label="진행률"
            value={`${data?.total ? Math.round((data.reviewed_count / data.total) * 100) : 0}%`}
            secondary="전체 대비 완료율"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-[32px] border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-40 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-violet-500" size={32} />
                <p className="text-zinc-400 font-medium text-sm">검수 데이터 로딩중...</p>
              </div>
            ) : error ? (
              <div className="py-40 flex flex-col items-center gap-4 text-rose-500">
                <p className="font-medium">데이터 로딩 실패</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      검수 ID
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      상품 정보
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                      Gemini
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                      구축모델
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                      결과
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                      상태
                    </th>
                    <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                      날짜
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {data?.items.map((item) => (
                    <tr
                      key={item.task_id}
                      className="group hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-4">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-900 transition-colors">
                            #{item.inspection_id}
                          </span>
                        </Link>
                      </td>
                      <td className="px-8 py-4">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate mb-0.5">
                              {item.product_name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {formatPrice(item.original_price)}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <GradeBadge grade={item.gemini_grade} />
                        </Link>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <GradeBadge grade={item.custom_grade} />
                        </Link>
                      </td>
                      <td className="px-8 py-4">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <div className="flex justify-center">
                            {item.grade_match === null ? (
                              <span className="inline-block whitespace-nowrap px-3 py-1 bg-zinc-100 text-zinc-400 rounded-full text-[10px] font-bold">
                                대기
                              </span>
                            ) : item.grade_match ? (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                                <CheckCircle size={12} /> 일치
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold border border-rose-100">
                                <XCircle size={12} /> 불일치
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-8 py-4 text-center whitespace-nowrap">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          {item.reviewed ? (
                            <span className="inline-block whitespace-nowrap px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                              완료
                            </span>
                          ) : (
                            <span className="inline-block whitespace-nowrap px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                              대기
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-8 py-4 text-right whitespace-nowrap">
                        <Link href={`/reviews/${item.task_id}`} className="block">
                          <div className="flex flex-col items-end">
                            <span className="text-xs font-semibold text-zinc-700 whitespace-nowrap">
                              {formatDate(item.created_at)}
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase font-medium whitespace-nowrap">
                              {formatTime(item.created_at)}
                            </span>
                          </div>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.items.length === 0) && !isLoading && (
                    <tr>
                      <td colSpan={7} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-2">
                            <Inbox className="text-zinc-200" size={32} />
                          </div>
                          <h3 className="text-zinc-900 font-bold">검수 내역이 없습니다</h3>
                          <p className="text-zinc-400 text-sm max-w-[240px]">
                            현재 필터 조건에 해당하는 검수 기록이 없습니다.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {data && data.total > 0 && (
            <div className="px-8 py-6 bg-[#FDFDFF] border-t border-zinc-100 flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400">
                총 {data.total}건 중 <span className="text-zinc-900 font-bold">{data.items.length}</span>건 표시
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(5, Math.ceil(data.total / limit)) }).map(
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === i
                            ? 'bg-zinc-900 text-white'
                            : 'text-zinc-500 hover:bg-zinc-100 border border-transparent'
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= data.total}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
