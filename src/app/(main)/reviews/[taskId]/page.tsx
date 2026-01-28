'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useReviewDetail, useSubmitReview } from '@/hooks/useReviews';
import { TopHeader } from '@/components/layout/TopHeader';
import { GradeBadge } from '@/components/ui/GradeBadge';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Verdict } from '@/types';

// 결함 종류별 색상 정의
const DEFECT_COLORS: Record<string, { border: string; bg: string; text: string; label: string }> = {
  hole: { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-600', label: '구멍' },
  tear: { border: 'border-orange-500', bg: 'bg-orange-500/20', text: 'text-orange-600', label: '찢어짐' },
  stain: { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-600', label: '얼룩' },
  pilling: { border: 'border-green-500', bg: 'bg-green-500/20', text: 'text-green-600', label: '보풀' },
  none: { border: 'border-gray-400', bg: 'bg-gray-400/20', text: 'text-gray-600', label: '없음' },
  // RT-DETR 구 형식 호환
  damage: { border: 'border-red-500', bg: 'bg-red-500/20', text: 'text-red-600', label: '손상' },
  attach: { border: 'border-green-500', bg: 'bg-green-500/20', text: 'text-green-600', label: '부착물' },
  pollution: { border: 'border-yellow-500', bg: 'bg-yellow-500/20', text: 'text-yellow-600', label: '오염' },
};

// 결함별 점수
const DEFECT_SCORES: Record<string, number> = {
  hole: 100,
  tear: 100,
  stain: 50,
  pilling: 20,
  none: 0,
  damage: 100,
  attach: 20,
  pollution: 50,
};

type ImageViewTab = 'original' | 'rtdetr' | 'gemini' | 'qwen';

const VERDICT_OPTIONS: { value: Verdict; label: string; description: string; color: string }[] = [
  { value: 'gemini_correct', label: 'Gemini', description: 'Gemini AI가 정확함', color: 'border-blue-500 bg-blue-50 hover:bg-blue-100' },
  { value: 'custom_correct', label: '구축모델', description: '구축모델이 정확함', color: 'border-violet-500 bg-violet-50 hover:bg-violet-100' },
  { value: 'both_correct', label: '둘 다', description: '두 모델 모두 정확함', color: 'border-emerald-500 bg-emerald-50 hover:bg-emerald-100' },
  { value: 'both_wrong', label: '오류', description: '두 모델 모두 오류', color: 'border-rose-500 bg-rose-50 hover:bg-rose-100' },
];

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const { data, isLoading, error } = useReviewDetail(taskId);
  const submitMutation = useSubmitReview();

  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | null>(null);
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ImageViewTab>('original');

  const handleSubmit = async () => {
    if (!selectedVerdict || !reviewerName.trim()) {
      alert('판정을 선택하고 리뷰어 이름을 입력해주세요.');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        taskId,
        data: {
          verdict: selectedVerdict,
          comment: comment || undefined,
          reviewed_by: reviewerName.trim(),
        },
      });
      alert('리뷰가 성공적으로 제출되었습니다.');
      router.push('/reviews');
    } catch {
      alert('리뷰 제출에 실패했습니다.');
    }
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return '-';
    return new Intl.NumberFormat('ko-KR').format(price) + ' KRW';
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return '-';
    return (ms / 1000).toFixed(1) + 's';
  };

  const getImageUrl = (key: string) => {
    return `https://images.banpoom.co.kr/${key}`;
  };

  if (isLoading) {
    return (
      <>
        <TopHeader title="검수 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-violet-500" size={32} />
            <p className="text-zinc-400 font-medium text-sm">검수 데이터 로딩중...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <TopHeader title="검수 상세" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-rose-500">
            <AlertCircle size={32} />
            <p className="font-medium">검수 데이터 로딩 실패</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopHeader title="검수 상세" breadcrumb="검수 목록" />

      <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/reviews"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            목록으로
          </Link>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-mono">
              #{data.inspection_id}
            </span>
            {data.reviewed ? (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
                검증완료
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                대기중
              </span>
            )}
          </div>
        </div>

        {/* Product Info Card */}
        <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">상품명</p>
              <p className="font-semibold text-zinc-900">{data.product_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">원가</p>
              <p className="font-semibold text-zinc-900">{formatPrice(data.original_price)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">카테고리</p>
              <p className="font-semibold text-zinc-900">{data.category}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">클레임</p>
              <p className="font-semibold text-zinc-900">{data.claim_reason || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">반품사유</p>
              <p className="font-semibold text-zinc-900 truncate">{data.return_reason || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tabbed Image Viewer */}
        <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
          {/* Tab Headers */}
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
            <button
              onClick={() => setActiveTab('original')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'original'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              원본
            </button>
            <button
              onClick={() => setActiveTab('rtdetr')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rtdetr'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              RT-DETR
              {data.raw_detections && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'rtdetr' ? 'bg-white/20' : 'bg-amber-200'
                }`}>
                  {data.raw_detections.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('gemini')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gemini'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Gemini
              {data.gemini.detections && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'gemini' ? 'bg-white/20' : 'bg-blue-200'
                }`}>
                  {data.gemini.detections.filter(d => d.class_name !== 'none').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('qwen')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'qwen'
                  ? 'bg-violet-500 text-white'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
              }`}
            >
              Qwen
              {data.custom.detections && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'qwen' ? 'bg-white/20' : 'bg-violet-200'
                }`}>
                  {data.custom.detections.filter(d => d.class_name !== 'none').length}
                </span>
              )}
            </button>
          </div>

          {/* Image Viewer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Image */}
            <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative">
              {activeTab === 'original' ? (
                // 원본 이미지 (원본 상품 이미지)
                data.original_image_keys.length > 0 ? (
                  <Image
                    src={getImageUrl(data.original_image_keys[selectedImageIndex % data.original_image_keys.length])}
                    alt="원본"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400">
                    원본 이미지 없음
                  </div>
                )
              ) : (
                // 검수 이미지 with BBox
                data.inspection_image_keys.length > 0 ? (
                  <>
                    <Image
                      src={getImageUrl(data.inspection_image_keys[selectedImageIndex % data.inspection_image_keys.length])}
                      alt="검수"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <BboxOverlay
                      detections={
                        activeTab === 'rtdetr'
                          ? data.raw_detections || []
                          : activeTab === 'gemini'
                          ? data.gemini.detections || []
                          : data.custom.detections || []
                      }
                      currentImage={
                        selectedImageIndex === 0
                          ? 'front'
                          : selectedImageIndex === 1
                          ? 'back'
                          : 'side'
                      }
                      imageUrl={getImageUrl(data.inspection_image_keys[selectedImageIndex % data.inspection_image_keys.length])}
                    />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400">
                    검수 이미지 없음
                  </div>
                )
              )}
            </div>

            {/* Detection Info Panel */}
            <div className="space-y-4">
              {/* Tab Description */}
              <div className={`p-4 rounded-xl ${
                activeTab === 'original' ? 'bg-zinc-50' :
                activeTab === 'rtdetr' ? 'bg-amber-50' :
                activeTab === 'gemini' ? 'bg-blue-50' : 'bg-violet-50'
              }`}>
                <h4 className={`font-bold text-sm mb-1 ${
                  activeTab === 'original' ? 'text-zinc-700' :
                  activeTab === 'rtdetr' ? 'text-amber-700' :
                  activeTab === 'gemini' ? 'text-blue-700' : 'text-violet-700'
                }`}>
                  {activeTab === 'original' && '원본 상품 이미지'}
                  {activeTab === 'rtdetr' && 'RT-DETR 탐지 (검증 전)'}
                  {activeTab === 'gemini' && 'Gemini 검증 결과'}
                  {activeTab === 'qwen' && 'Qwen 검증 결과'}
                </h4>
                <p className={`text-xs ${
                  activeTab === 'original' ? 'text-zinc-500' :
                  activeTab === 'rtdetr' ? 'text-amber-600' :
                  activeTab === 'gemini' ? 'text-blue-600' : 'text-violet-600'
                }`}>
                  {activeTab === 'original' && '판매 등록 시 촬영된 상품 이미지입니다.'}
                  {activeTab === 'rtdetr' && 'RT-DETR 모델이 탐지한 모든 결함 영역입니다.'}
                  {activeTab === 'gemini' && 'Gemini AI가 검증한 결함만 표시됩니다.'}
                  {activeTab === 'qwen' && 'Qwen2-VL이 검증한 결함만 표시됩니다.'}
                </p>
              </div>

              {/* Detection List */}
              {activeTab !== 'original' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">탐지 목록</h4>
                  <DetectionList
                    detections={
                      activeTab === 'rtdetr'
                        ? data.raw_detections || []
                        : activeTab === 'gemini'
                        ? data.gemini.detections || []
                        : data.custom.detections || []
                    }
                    currentImage={
                      selectedImageIndex === 0
                        ? 'front'
                        : selectedImageIndex === 1
                        ? 'back'
                        : 'side'
                    }
                  />
                </div>
              )}

              {/* Color Legend */}
              {activeTab !== 'original' && (
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">결함 색상 범례</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(DEFECT_COLORS).slice(0, 5).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${value.border} ${value.bg} border-2`} />
                        <span className="text-xs text-zinc-600">
                          {value.label} ({DEFECT_SCORES[key]}점)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image Selector */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-100">
            {(activeTab === 'original' ? data.original_image_keys : data.inspection_image_keys).map((key, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedImageIndex === idx
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {key.includes('front') ? '앞면' : key.includes('back') ? '뒷면' : `이미지 ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Detection Comparison Table */}
        <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 mb-4">탐지 결과 비교</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-bold text-zinc-500">구분</th>
                  <th className="text-center py-3 px-4 font-bold text-amber-600 bg-amber-50 rounded-tl-lg">RT-DETR (원본)</th>
                  <th className="text-center py-3 px-4 font-bold text-blue-600 bg-blue-50">Gemini</th>
                  <th className="text-center py-3 px-4 font-bold text-violet-600 bg-violet-50 rounded-tr-lg">Qwen</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="py-3 px-4 font-medium text-zinc-700">탐지 수</td>
                  <td className="text-center py-3 px-4 bg-amber-50/50">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      {data.raw_detections?.length || 0}건
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 bg-blue-50/50">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {data.gemini.detections?.filter(d => d.class_name !== 'none').length || 0}건
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 bg-violet-50/50">
                    <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                      {data.custom.detections?.filter(d => d.class_name !== 'none').length || 0}건
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-3 px-4 font-medium text-zinc-700">결함 종류</td>
                  <td className="py-3 px-4 bg-amber-50/50">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[...new Set(data.raw_detections?.map(d => d.class_name) || [])].map((cls, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${DEFECT_COLORS[cls]?.bg || 'bg-zinc-100'} ${DEFECT_COLORS[cls]?.text || 'text-zinc-600'}`}>
                          {DEFECT_COLORS[cls]?.label || cls}
                        </span>
                      ))}
                      {(!data.raw_detections || data.raw_detections.length === 0) && <span className="text-zinc-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 bg-blue-50/50">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[...new Set(data.gemini.detections?.filter(d => d.class_name !== 'none').map(d => d.class_name) || [])].map((cls, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${DEFECT_COLORS[cls]?.bg || 'bg-zinc-100'} ${DEFECT_COLORS[cls]?.text || 'text-zinc-600'}`}>
                          {DEFECT_COLORS[cls]?.label || cls}
                        </span>
                      ))}
                      {(!data.gemini.detections || data.gemini.detections.filter(d => d.class_name !== 'none').length === 0) && <span className="text-zinc-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 bg-violet-50/50">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {[...new Set(data.custom.detections?.filter(d => d.class_name !== 'none').map(d => d.class_name) || [])].map((cls, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-medium ${DEFECT_COLORS[cls]?.bg || 'bg-zinc-100'} ${DEFECT_COLORS[cls]?.text || 'text-zinc-600'}`}>
                          {DEFECT_COLORS[cls]?.label || cls}
                        </span>
                      ))}
                      {(!data.custom.detections || data.custom.detections.filter(d => d.class_name !== 'none').length === 0) && <span className="text-zinc-400 text-xs">-</span>}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-3 px-4 font-medium text-zinc-700">총점</td>
                  <td className="text-center py-3 px-4 bg-amber-50/50">
                    <span className="text-lg font-bold text-amber-700">
                      {data.raw_detections?.reduce((sum, d) => sum + (DEFECT_SCORES[d.class_name] || 0), 0) || 0}점
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 bg-blue-50/50">
                    <span className="text-lg font-bold text-blue-700">
                      {data.gemini.total_score ?? '-'}점
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 bg-violet-50/50">
                    <span className="text-lg font-bold text-violet-700">
                      {data.custom.total_score ?? '-'}점
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-zinc-700">등급</td>
                  <td className="text-center py-3 px-4 bg-amber-50/50 rounded-bl-lg">
                    {(() => {
                      const score = data.raw_detections?.reduce((sum, d) => sum + (DEFECT_SCORES[d.class_name] || 0), 0) || 0;
                      const grade = score < 20 ? 'S' : score < 50 ? 'A' : score < 100 ? 'B' : 'F';
                      return <GradeBadge grade={grade} size="lg" />;
                    })()}
                  </td>
                  <td className="text-center py-3 px-4 bg-blue-50/50">
                    <GradeBadge grade={data.gemini.grade} size="lg" />
                  </td>
                  <td className="text-center py-3 px-4 bg-violet-50/50 rounded-br-lg">
                    <GradeBadge grade={data.custom.grade} size="lg" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Results Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gemini Result */}
          <div className={`bg-white p-6 rounded-[24px] border shadow-sm ${data.gemini.error ? 'border-rose-200' : 'border-blue-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Gemini AI</h3>
                  <p className="text-xs text-zinc-400">구글 비전 모델</p>
                </div>
              </div>
              <div className="text-right">
                <GradeBadge grade={data.gemini.grade} size="lg" />
                <p className="text-lg font-bold text-zinc-900 mt-1">{formatPrice(data.gemini.result_price)}</p>
              </div>
            </div>

            {data.gemini.error ? (
              <div className="p-4 bg-rose-50 rounded-xl text-rose-600 text-sm">
                <AlertCircle className="inline mr-2" size={16} />
                {data.gemini.error}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Score Info */}
                {data.gemini.total_score !== undefined && data.gemini.total_score !== null && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-blue-600">결함 점수</p>
                      <p className="text-xl font-bold text-blue-700">{data.gemini.total_score}점</p>
                    </div>
                    <div className="text-right text-[10px] text-blue-500">
                      <p>S: 0-19 | A: 20-49</p>
                      <p>B: 50-99 | F: 100+</p>
                    </div>
                  </div>
                )}

                {/* Grade Reason */}
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <p className="text-xs font-bold text-zinc-700 mb-2">판정 사유</p>
                  <p className="text-sm text-zinc-700">{data.gemini.grade_reason || '-'}</p>
                </div>

                {/* Timing Info */}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-100">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    총 {formatTime(data.gemini.inference_time_ms)}
                  </span>
                  <span>Gemini: {formatTime(data.gemini.gemini_time_ms)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Custom Model Result */}
          <div className={`bg-white p-6 rounded-[24px] border shadow-sm ${data.custom.error ? 'border-rose-200' : 'border-violet-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">구축모델</h3>
                  <p className="text-xs text-zinc-400">RT-DETR + Qwen2-VL</p>
                </div>
              </div>
              <div className="text-right">
                <GradeBadge grade={data.custom.grade} size="lg" />
                <p className="text-lg font-bold text-zinc-900 mt-1">{formatPrice(data.custom.result_price)}</p>
              </div>
            </div>

            {data.custom.error ? (
              <div className="p-4 bg-rose-50 rounded-xl text-rose-600 text-sm">
                <AlertCircle className="inline mr-2" size={16} />
                {data.custom.error}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Score Info */}
                {data.custom.total_score !== undefined && data.custom.total_score !== null && (
                  <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                    <div>
                      <p className="text-[10px] text-violet-600">결함 점수</p>
                      <p className="text-xl font-bold text-violet-700">{data.custom.total_score}점</p>
                    </div>
                    <div className="text-right text-[10px] text-violet-500">
                      <p>S: 0-19 | A: 20-49</p>
                      <p>B: 50-99 | F: 100+</p>
                    </div>
                  </div>
                )}

                {/* Grade Reason */}
                <div className="p-4 bg-zinc-50 rounded-xl">
                  <p className="text-xs font-bold text-violet-700 mb-2">판정 사유</p>
                  <p className="text-sm text-zinc-700">{data.custom.grade_reason || '-'}</p>
                </div>

                {/* Origin Comparison */}
                {data.custom.origin_comparison && (
                  <div className="p-4 bg-zinc-50 rounded-xl">
                    <p className="text-xs font-bold text-zinc-700 mb-2">원본 비교 결과</p>
                    {'is_valid' in data.custom.origin_comparison ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).is_valid ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold">
                              <AlertCircle size={14} /> 새로운 결함 확인
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                              <Check size={14} /> 기존 결함/디자인
                            </span>
                          )}
                        </div>
                        {(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).validation_reason && (
                          <p className="text-xs text-zinc-600 mt-2">{(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).validation_reason}</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1 p-2 bg-white rounded-lg">
                          동일상품: {(data.custom.origin_comparison as { same_product: boolean | null }).same_product ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-white rounded-lg">
                          기존결함: {(data.custom.origin_comparison as { defect_in_origin: boolean | null }).defect_in_origin ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                        <div className="flex items-center gap-1 p-2 bg-white rounded-lg">
                          디자인: {(data.custom.origin_comparison as { is_design: boolean | null }).is_design ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timing Info */}
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-2 border-t border-zinc-100">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    총 {formatTime(data.custom.inference_time_ms)}
                  </span>
                  <span>RT-DETR: {formatTime(data.custom.rtdetr_time_ms)} | Qwen: {formatTime(data.custom.qwen_time_ms)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Expert Review Form */}
        {!data.reviewed ? (
          <div className="bg-white p-8 rounded-[24px] border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-6">전문가 검증</h3>

            <div className="space-y-6">
              {/* Verdict Selection */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">판정 선택</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {VERDICT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedVerdict(option.value)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedVerdict === option.value
                          ? option.color + ' border-2'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <p className="font-bold text-sm mb-1">{option.label}</p>
                      <p className="text-[10px] text-zinc-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">코멘트 (선택)</p>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="추가 메모..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
                />
              </div>

              {/* Reviewer Name */}
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">리뷰어 이름 *</p>
                <input
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="이름 입력"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:outline-none transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedVerdict || !reviewerName.trim() || submitMutation.isPending}
                  className="flex-1 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                  리뷰 제출
                </button>
                <button
                  onClick={() => router.push('/reviews')}
                  className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all"
                >
                  건너뛰기
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[24px] border border-emerald-200 shadow-sm">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">리뷰 완료</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-zinc-400 mb-1">판정</p>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">
                  {data.review?.verdict === 'gemini_correct' && 'Gemini 정확'}
                  {data.review?.verdict === 'custom_correct' && '구축모델 정확'}
                  {data.review?.verdict === 'both_correct' && '둘 다 정확'}
                  {data.review?.verdict === 'both_wrong' && '둘 다 오류'}
                </span>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">리뷰어</p>
                <p className="font-semibold text-zinc-900">{data.review?.reviewed_by}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 mb-1">날짜</p>
                <p className="font-semibold text-zinc-900">
                  {data.review?.reviewed_at && new Date(data.review.reviewed_at).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function BboxOverlay({
  detections,
  currentImage,
  imageUrl,
}: {
  detections: { class_name: string; confidence: number; bbox: number[]; source_image: string | null }[];
  currentImage: string;
  imageUrl: string;
}) {
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const filtered = detections.filter(
    (d) => d.source_image === currentImage || d.source_image === null
  );

  if (filtered.length === 0 || !imageSize) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {filtered.map((d, idx) => {
        const [x1, y1, x2, y2] = d.bbox;
        const left = (x1 / imageSize.width) * 100;
        const top = (y1 / imageSize.height) * 100;
        const width = ((x2 - x1) / imageSize.width) * 100;
        const height = ((y2 - y1) / imageSize.height) * 100;
        const color = DEFECT_COLORS[d.class_name] || DEFECT_COLORS.none;

        return (
          <div
            key={idx}
            className={`absolute border-2 rounded ${color.border} ${color.bg}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <span className={`absolute -top-6 left-0 text-[10px] px-2 py-0.5 rounded font-bold ${color.bg} ${color.text} border ${color.border}`}>
              {d.class_name} {(d.confidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DetectionList({
  detections,
  currentImage,
}: {
  detections: { class_name: string; confidence: number; bbox: number[]; source_image: string | null }[];
  currentImage: string;
}) {
  const filtered = detections.filter(
    (d) => d.source_image === currentImage || d.source_image === null
  );

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400 text-sm">
        현재 이미지에서 탐지된 결함이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto">
      {filtered.map((d, idx) => {
        const color = DEFECT_COLORS[d.class_name] || DEFECT_COLORS.none;
        const score = DEFECT_SCORES[d.class_name] || 0;

        return (
          <div
            key={idx}
            className={`p-3 rounded-xl border ${color.border} ${color.bg}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color.border} border-2`} />
                <span className={`font-bold text-sm ${color.text}`}>
                  {color.label || d.class_name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>
                  {(d.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <span className={`text-xs font-bold ${color.text}`}>
                +{score}점
              </span>
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">
              위치: [{d.bbox.join(', ')}]
            </div>
          </div>
        );
      })}
    </div>
  );
}
