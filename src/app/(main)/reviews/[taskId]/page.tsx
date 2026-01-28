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
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { Verdict } from '@/types';

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
  const [selectedInspectionImage, setSelectedInspectionImage] = useState(0);
  const [selectedOriginalImage, setSelectedOriginalImage] = useState(0);
  const [showBbox, setShowBbox] = useState(true);

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

        {/* Image Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 mb-4">원본 이미지</h3>
            <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative mb-4">
              {data.original_image_keys.length > 0 ? (
                <Image
                  src={getImageUrl(data.original_image_keys[selectedOriginalImage])}
                  alt="원본"
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  이미지 없음
                </div>
              )}
            </div>
            {data.original_image_keys.length > 1 && (
              <div className="flex gap-2">
                {data.original_image_keys.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedOriginalImage(idx)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                      selectedOriginalImage === idx
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Inspection Image */}
          <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-900">검수 이미지</h3>
              <button
                onClick={() => setShowBbox((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  showBbox ? 'bg-violet-100 text-violet-700' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {showBbox ? <Eye size={14} /> : <EyeOff size={14} />}
                BBox
              </button>
            </div>
            <div className="aspect-square bg-zinc-100 rounded-2xl overflow-hidden relative mb-4">
              {data.inspection_image_keys.length > 0 ? (
                <>
                  <Image
                    src={getImageUrl(data.inspection_image_keys[selectedInspectionImage])}
                    alt="검수"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {showBbox && data.custom.detections && (
                    <BboxOverlay
                      detections={data.custom.detections}
                      currentImage={
                        selectedInspectionImage === 0
                          ? 'front'
                          : selectedInspectionImage === 1
                          ? 'back'
                          : 'side'
                      }
                      imageUrl={getImageUrl(data.inspection_image_keys[selectedInspectionImage])}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-400">
                  이미지 없음
                </div>
              )}
            </div>
            {data.inspection_image_keys.length > 1 && (
              <div className="flex gap-2">
                {data.inspection_image_keys.map((key, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedInspectionImage(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedInspectionImage === idx
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {key.includes('front') ? '앞면' : key.includes('back') ? '뒷면' : `${idx + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RT-DETR Raw Detections */}
        {data.raw_detections && data.raw_detections.length > 0 && (
          <div className="bg-white p-6 rounded-[24px] border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">RT-DETR 원본 탐지</h3>
                  <p className="text-xs text-zinc-400">Qwen 검증 전 탐지 결과</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                {data.raw_detections.length}건 탐지
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.raw_detections.map((d, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-amber-800">
                      {d.class_name}
                    </span>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                      {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-600 mt-1">
                    {d.source_image || 'unknown'} | bbox: [{d.bbox.join(', ')}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Results Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gemini Result */}
          <div className={`bg-white p-6 rounded-[24px] border shadow-sm ${data.gemini.error ? 'border-rose-200' : 'border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Gemini AI</h3>
                  <p className="text-xs text-zinc-400">구글 비전 모델</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Clock size={12} />
                {formatTime(data.gemini.inference_time_ms)}
              </div>
            </div>

            {data.gemini.error ? (
              <div className="p-4 bg-rose-50 rounded-xl text-rose-600 text-sm">
                <AlertCircle className="inline mr-2" size={16} />
                {data.gemini.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">등급</p>
                    <GradeBadge grade={data.gemini.grade} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 mb-1">산정가격</p>
                    <p className="text-xl font-bold text-zinc-900">{formatPrice(data.gemini.result_price)}</p>
                  </div>
                </div>

                {/* Grade Reason */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2">판정 사유</p>
                  <p className="text-sm text-zinc-700">{data.gemini.grade_reason || '-'}</p>
                </div>

                {/* Total Score */}
                {data.gemini.total_score !== undefined && data.gemini.total_score !== null && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-blue-700">총점</p>
                      <p className="text-lg font-bold text-blue-700">{data.gemini.total_score}점</p>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-1">
                      S: 0-19 | A: 20-49 | B: 50-99 | F: 100+
                    </p>
                  </div>
                )}

                {/* Detection Results */}
                {data.gemini.detections && data.gemini.detections.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs font-bold text-blue-700 mb-2">검증된 결함</p>
                    <div className="flex flex-wrap gap-2">
                      {data.gemini.detections
                        .filter((d) => d.class_name !== 'none')
                        .map((d, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-blue-700 border border-blue-200">
                            {d.class_name} {d.source_image ? `@${d.source_image}` : ''}
                          </span>
                        ))}
                      {data.gemini.detections.filter((d) => d.class_name !== 'none').length === 0 && (
                        <span className="text-xs text-blue-500">결함 없음</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-zinc-400">
                  Gemini: {formatTime(data.gemini.gemini_time_ms)}
                </div>
              </div>
            )}
          </div>

          {/* Custom Model Result */}
          <div className={`bg-white p-6 rounded-[24px] border shadow-sm ${data.custom.error ? 'border-rose-200' : 'border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">구축모델</h3>
                  <p className="text-xs text-zinc-400">RT-DETR + Qwen2-VL</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Clock size={12} />
                {formatTime(data.custom.inference_time_ms)}
              </div>
            </div>

            {data.custom.error ? (
              <div className="p-4 bg-rose-50 rounded-xl text-rose-600 text-sm">
                <AlertCircle className="inline mr-2" size={16} />
                {data.custom.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">등급</p>
                    <GradeBadge grade={data.custom.grade} size="lg" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400 mb-1">산정가격</p>
                    <p className="text-xl font-bold text-zinc-900">{formatPrice(data.custom.result_price)}</p>
                  </div>
                </div>

                {/* Grade Reason */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2">판정 사유</p>
                  <p className="text-sm text-zinc-700">{data.custom.grade_reason || '-'}</p>
                </div>

                {/* Total Score */}
                {data.custom.total_score !== undefined && data.custom.total_score !== null && (
                  <div className="p-3 bg-violet-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-violet-700">총점</p>
                      <p className="text-lg font-bold text-violet-700">{data.custom.total_score}점</p>
                    </div>
                    <p className="text-[10px] text-violet-500 mt-1">
                      S: 0-19 | A: 20-49 | B: 50-99 | F: 100+
                    </p>
                  </div>
                )}

                {/* Detection Results */}
                {data.custom.detections && data.custom.detections.length > 0 && (
                  <div className="p-4 bg-violet-50 rounded-xl">
                    <p className="text-xs font-bold text-violet-700 mb-2">RT-DETR 탐지결과</p>
                    <div className="flex flex-wrap gap-2">
                      {data.custom.detections
                        .filter((d) => d.class_name !== 'none')
                        .map((d, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white rounded-lg text-xs font-medium text-violet-700 border border-violet-200">
                            {d.class_name} {(d.confidence * 100).toFixed(0)}%
                          </span>
                        ))}
                      {data.custom.detections.filter((d) => d.class_name !== 'none').length === 0 && (
                        <span className="text-xs text-violet-500">결함 없음</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Origin Comparison */}
                {data.custom.origin_comparison && (
                  <div className="p-4 bg-zinc-50 rounded-xl">
                    <p className="text-xs font-bold text-zinc-700 mb-2">원본 비교</p>
                    {'is_valid' in data.custom.origin_comparison ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span>결함 유효성:</span>
                          {(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).is_valid ? (
                            <span className="flex items-center gap-1 text-rose-600 font-medium">
                              <Check size={14} /> 새로운 결함
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <X size={14} /> 기존 결함/디자인
                            </span>
                          )}
                        </div>
                        {(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).validation_reason && (
                          <p className="text-xs text-zinc-500">{(data.custom.origin_comparison as { is_valid: boolean; validation_reason: string | null }).validation_reason}</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          동일상품: {(data.custom.origin_comparison as { same_product: boolean | null }).same_product ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          기존결함: {(data.custom.origin_comparison as { defect_in_origin: boolean | null }).defect_in_origin ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          디자인: {(data.custom.origin_comparison as { is_design: boolean | null }).is_design ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-zinc-400">
                  RT-DETR: {formatTime(data.custom.rtdetr_time_ms)} | Qwen: {formatTime(data.custom.qwen_time_ms)}
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

  const colors: Record<string, string> = {
    // 새 형식 (DefectType values)
    hole: 'border-rose-500 bg-rose-500/20',
    tear: 'border-red-500 bg-red-500/20',
    stain: 'border-orange-500 bg-orange-500/20',
    pilling: 'border-amber-500 bg-amber-500/20',
    none: 'border-zinc-400 bg-zinc-400/20',
    // 구 형식 (RT-DETR class names) - 하위 호환
    damage: 'border-rose-500 bg-rose-500/20',
    attach: 'border-amber-500 bg-amber-500/20',
    pollution: 'border-orange-500 bg-orange-500/20',
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {filtered.map((d, idx) => {
        const [x1, y1, x2, y2] = d.bbox;
        // 원본 이미지의 실제 해상도 기준으로 백분율 계산
        const left = (x1 / imageSize.width) * 100;
        const top = (y1 / imageSize.height) * 100;
        const width = ((x2 - x1) / imageSize.width) * 100;
        const height = ((y2 - y1) / imageSize.height) * 100;

        return (
          <div
            key={idx}
            className={`absolute border-2 rounded ${colors[d.class_name] || 'border-zinc-500'}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
          >
            <span className="absolute -top-6 left-0 text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded font-bold">
              {d.class_name} {(d.confidence * 100).toFixed(0)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
