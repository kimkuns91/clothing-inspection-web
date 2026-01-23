import type {
  ReviewListResponse,
  ReviewDetail,
  StatsResponse,
  ReviewSubmitRequest,
  Review,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // 리뷰 목록 조회
  async getReviews(params?: {
    reviewed?: boolean;
    grade_match?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ReviewListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.reviewed !== undefined) {
      searchParams.set('reviewed', String(params.reviewed));
    }
    if (params?.grade_match !== undefined) {
      searchParams.set('grade_match', String(params.grade_match));
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit));
    }
    if (params?.offset) {
      searchParams.set('offset', String(params.offset));
    }

    const query = searchParams.toString();
    return this.fetch<ReviewListResponse>(`/api/reviews${query ? `?${query}` : ''}`);
  }

  // 리뷰 상세 조회
  async getReviewDetail(taskId: string): Promise<ReviewDetail> {
    return this.fetch<ReviewDetail>(`/api/reviews/${taskId}`);
  }

  // 리뷰 제출
  async submitReview(taskId: string, data: ReviewSubmitRequest): Promise<Review> {
    return this.fetch<Review>(`/api/reviews/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 통계 조회
  async getStats(): Promise<StatsResponse> {
    return this.fetch<StatsResponse>('/api/reviews/stats');
  }
}

export const api = new ApiClient(API_URL);
