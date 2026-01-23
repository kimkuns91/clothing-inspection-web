'use client';

import dynamic from 'next/dynamic';
import { useStats } from '@/hooks/useReviews';
import { TopHeader } from '@/components/layout/TopHeader';
import { StatBox } from '@/components/ui/StatBox';
import { Loader2, Users, Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

const DashboardCharts = dynamic(
  () => import('@/components/ui/DashboardCharts').then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[28px] border border-zinc-200 shadow-sm h-[380px] flex items-center justify-center">
          <Loader2 className="animate-spin text-violet-500" size={24} />
        </div>
        <div className="bg-white p-8 rounded-[28px] border border-zinc-200 shadow-sm h-[380px] flex items-center justify-center">
          <Loader2 className="animate-spin text-violet-500" size={24} />
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { data, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <>
        <TopHeader title="통계 대시보드" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-violet-500" size={32} />
            <p className="text-zinc-400 font-medium text-sm">통계 로딩중...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <TopHeader title="통계 대시보드" />
        <div className="flex-1 flex items-center justify-center text-rose-500">
          통계 데이터 로딩 실패
        </div>
      </>
    );
  }

  // 판단 분포 차트 데이터
  const verdictData = [
    { name: 'Gemini 정확', value: data.verdict_distribution['gemini_correct'] || 0 },
    { name: '구축모델 정확', value: data.verdict_distribution['custom_correct'] || 0 },
    { name: '둘 다 정확', value: data.verdict_distribution['both_correct'] || 0 },
    { name: '둘 다 오류', value: data.verdict_distribution['both_wrong'] || 0 },
  ];

  // 등급 분포 차트 데이터
  const gradeCompareData = ['S', 'A', 'B', 'F'].map((grade) => ({
    grade,
    Gemini: data.gemini_grade_distribution[grade] || 0,
    Custom: data.custom_grade_distribution[grade] || 0,
  }));

  const geminiAccuracy = data.reviewed > 0
    ? (((data.verdict_distribution['gemini_correct'] || 0) +
        (data.verdict_distribution['both_correct'] || 0)) /
        data.reviewed) * 100
    : 0;

  const customAccuracy = data.reviewed > 0
    ? (((data.verdict_distribution['custom_correct'] || 0) +
        (data.verdict_distribution['both_correct'] || 0)) /
        data.reviewed) * 100
    : 0;

  return (
    <>
      <TopHeader title="통계 대시보드" />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            성능 분석
          </h2>
          <p className="text-zinc-500 text-sm">
            AI 모델 성능을 비교하고 검증 지표를 추적합니다.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBox
            label="전체 검수"
            value={data.total}
            secondary="누적 검수 건수"
            icon={<Target size={40} className="text-violet-600" />}
          />
          <StatBox
            label="등급 일치율"
            value={`${data.grade_match_rate}%`}
            secondary={`${data.grade_match_count}건 일치`}
            highlight="text-emerald-600"
            icon={<TrendingUp size={40} className="text-emerald-600" />}
          />
          <StatBox
            label="Gemini 정확률"
            value={`${geminiAccuracy.toFixed(1)}%`}
            secondary="전문가 검증 기준"
            highlight="text-blue-600"
            icon={<Sparkles size={40} className="text-blue-600" />}
          />
          <StatBox
            label="구축모델 정확률"
            value={`${customAccuracy.toFixed(1)}%`}
            secondary="전문가 검증 기준"
            highlight="text-violet-600"
            icon={<Zap size={40} className="text-violet-600" />}
          />
        </div>

        {/* Charts - dynamically loaded */}
        <DashboardCharts verdictData={verdictData} gradeCompareData={gradeCompareData} />

        {/* Reviewer Stats */}
        <div className="bg-white rounded-[28px] border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">리뷰어별 통계</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                    리뷰어
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    총 리뷰
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    Gemini 정확
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    구축모델 정확
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    둘 다 정확
                  </th>
                  <th className="px-8 py-5 text-[11px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    둘 다 오류
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.reviewer_stats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-zinc-400">
                      아직 리뷰 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  data.reviewer_stats.map((reviewer) => (
                    <tr key={reviewer.reviewer} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs">
                            {reviewer.reviewer.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-zinc-900">{reviewer.reviewer}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="font-bold text-zinc-900">{reviewer.total}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                          {reviewer.gemini_correct}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-bold">
                          {reviewer.custom_correct}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                          {reviewer.both_correct}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold">
                          {reviewer.both_wrong}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
