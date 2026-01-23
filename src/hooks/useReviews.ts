import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ReviewSubmitRequest } from '@/types';

// 리뷰 목록 조회
export function useReviews(params?: {
  reviewed?: boolean;
  grade_match?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => api.getReviews(params),
  });
}

// 리뷰 상세 조회
export function useReviewDetail(taskId: string) {
  return useQuery({
    queryKey: ['review', taskId],
    queryFn: () => api.getReviewDetail(taskId),
    enabled: !!taskId,
  });
}

// 리뷰 제출
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: ReviewSubmitRequest }) =>
      api.submitReview(taskId, data),
    onSuccess: () => {
      // 리뷰 목록 및 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// 통계 조회
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  });
}
