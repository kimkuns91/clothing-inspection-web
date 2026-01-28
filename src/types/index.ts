// 판단 결과
export type Verdict = 'gemini_correct' | 'custom_correct' | 'both_correct' | 'both_wrong';

// 검수 상세 항목
export interface InspectionDetailItem {
  title: string;
  content: string;
}

// 검수 상세 응답
export interface InspectionDetails {
  items: InspectionDetailItem[];
  summary: string;
}

// RT-DETR 탐지 항목
export interface DetectionItem {
  class_name: string;
  confidence: number;
  bbox: number[];
  source_image: string | null;
}

// 원본 비교 결과 (구버전)
export interface OriginComparisonLegacy {
  same_product: boolean | null;
  defect_in_origin: boolean | null;
  is_design: boolean | null;
  reason: string | null;
}

// 원본 비교 결과 (신버전)
export interface OriginComparisonNew {
  is_valid: boolean;
  validation_reason: string | null;
}

// 원본 비교 결과 (둘 다 지원)
export type OriginComparison = OriginComparisonLegacy | OriginComparisonNew;

// Gemini 결과
export interface GeminiResult {
  grade: string | null;
  grade_reason: string | null;
  result_price: number | null;
  details: InspectionDetails | null;
  detections: DetectionItem[] | null;
  total_score: number | null;
  inference_time_ms: number | null;
  gemini_time_ms: number | null;
  error: string | null;
}

// 구축모델 결과
export interface CustomResult {
  grade: string | null;
  grade_reason: string | null;
  result_price: number | null;
  details: InspectionDetails | null;
  detections: DetectionItem[] | null;
  origin_comparison: OriginComparison | null;
  inference_time_ms: number | null;
  rtdetr_time_ms: number | null;
  qwen_time_ms: number | null;
  total_score: number | null;
  error: string | null;
}

// 리뷰 응답
export interface Review {
  task_id: string;
  verdict: Verdict;
  reviewed_by: string;
  reviewed_at: string;
}

// 리뷰 상세 응답
export interface ReviewDetail {
  task_id: string;
  inspection_id: number;
  product_id: number;
  product_name: string;
  category: string;
  original_price: number | null;
  claim_reason: string | null;
  return_reason: string | null;
  inspection_image_keys: string[];
  original_image_keys: string[];
  gemini: GeminiResult;
  custom: CustomResult;
  raw_detections: DetectionItem[] | null;  // RT-DETR 원본 탐지 결과 (Qwen 검증 전)
  grade_match: boolean | null;
  price_diff: number | null;
  reviewed: boolean;
  review: Review | null;
  created_at: string;
}

// 리뷰 목록 항목
export interface ReviewListItem {
  task_id: string;
  inspection_id: number;
  product_name: string;
  original_price: number | null;
  gemini_grade: string | null;
  custom_grade: string | null;
  grade_match: boolean | null;
  reviewed: boolean;
  created_at: string;
}

// 리뷰 목록 응답
export interface ReviewListResponse {
  items: ReviewListItem[];
  total: number;
  pending_count: number;
  reviewed_count: number;
}

// 통계 응답
export interface StatsResponse {
  total: number;
  reviewed: number;
  pending: number;
  grade_match_count: number;
  grade_match_rate: number;
  verdict_distribution: Record<string, number>;
  gemini_grade_distribution: Record<string, number>;
  custom_grade_distribution: Record<string, number>;
  reviewer_stats: ReviewerStat[];
}

// 리뷰어 통계
export interface ReviewerStat {
  reviewer: string;
  total: number;
  gemini_correct: number;
  custom_correct: number;
  both_correct: number;
  both_wrong: number;
}

// 리뷰 제출 요청
export interface ReviewSubmitRequest {
  verdict: Verdict;
  comment?: string;
  reviewed_by: string;
}
