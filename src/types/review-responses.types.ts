// Frontend TypeScript interfaces for Review Response System
// Based on PRD requirements and backend API structure

export type ResponseStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

// Core Review Response interface
export interface ReviewResponse {
  id: string;
  review_id: string;
  responder_id: string;
  content: string;
  status: ResponseStatus;
  moderation_notes?: string;
  moderator_id?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
}

// Response Analytics interface
export interface ResponseAnalytics {
  id: string;
  response_id: string;
  helpful_votes: number;
  unhelpful_votes: number;
  views_count: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

// Extended Review Response with user and analytics data
export interface ReviewResponseWithDetails extends ReviewResponse {
  responder: {
    id: string;
    name: string;
    avatar?: string;
  };
  analytics: ResponseAnalytics;
  review: {
    id: string;
    rating: number;
    comment?: string;
    from_user_id: string;
    to_user_id: string;
  };
}

// User interface for responders
export interface ResponseUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

// DTOs for API requests
export interface CreateReviewResponseRequest {
  review_id: string;
  content: string;
}

export interface UpdateReviewResponseRequest {
  content: string;
}

export interface VoteResponseRequest {
  response_id: string;
  vote_type: 'helpful' | 'unhelpful';
}

export interface ModerateResponseRequest {
  status: ResponseStatus;
  moderation_notes?: string;
}

// API Response types
export interface ReviewResponseCreateResponse {
  success: true;
  message: string;
  data: ReviewResponse;
}

export interface ReviewResponseUpdateResponse {
  success: true;
  message: string;
  data: ReviewResponse;
}

export interface ReviewResponseDeleteResponse {
  success: true;
  message: string;
}

export interface ReviewResponseFetchResponse {
  success: true;
  message: string;
  data: {
    data: ReviewResponseWithDetails[];
    count: number;
  };
}

export interface ReviewResponseModerateResponse {
  success: true;
  message: string;
  data: ReviewResponse;
}

export interface ResponseVoteResponse {
  success: true;
  message: string;
  data: {
    response_id: string;
    vote_type: 'helpful' | 'unhelpful';
    total_helpful: number;
    total_unhelpful: number;
  };
}

export interface ResponseAnalyticsResponse {
  success: true;
  message: string;
  data: {
    total_responses: number;
    response_rate: number;
    quality_score: number;
    engagement_metrics: {
      total_views: number;
      total_helpful_votes: number;
      total_unhelpful_votes: number;
      average_engagement_score: number;
    };
  };
}

export interface ResponseGuidelinesResponse {
  success: true;
  message: string;
  data: {
    professional_tone: string;
    specificity: string;
    gratitude: string;
    action_items: string;
    length_guidelines: string;
    examples: {
      good: string;
      bad: string;
    };
    validation_rules: {
      min_length: number;
      max_length: number;
      prohibited_content: string[];
    };
  };
}

export interface ReviewResponseErrorResponse {
  success: false;
  message: string;
  data?: unknown;
  error_code?: string;
}

// Union type for all API responses
export type ReviewResponseAPIResponse = 
  | ReviewResponseCreateResponse
  | ReviewResponseUpdateResponse
  | ReviewResponseDeleteResponse
  | ReviewResponseFetchResponse
  | ReviewResponseModerateResponse
  | ResponseVoteResponse
  | ResponseAnalyticsResponse
  | ResponseGuidelinesResponse
  | ReviewResponseErrorResponse;

// Component Props interfaces
export interface ReviewResponseInterfaceProps {
  reviewId: string;
  currentUserId?: string;
  userRole?: string;
  onResponseCreated?: (response: ReviewResponse) => void;
  onResponseUpdated?: (response: ReviewResponse) => void;
  onResponseDeleted?: (responseId: string) => void;
}

export interface ResponseCreationProps {
  reviewId: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  guidelines?: ResponseGuidelinesResponse['data'];
}

export interface ResponseDisplayProps {
  response: ReviewResponseWithDetails;
  currentUserId?: string;
  userRole?: string;
  onVote?: (responseId: string, voteType: 'helpful' | 'unhelpful') => Promise<void>;
  onEdit?: (response: ReviewResponse) => void;
  onDelete?: (responseId: string) => void;
  showModerationActions?: boolean;
}

export interface ResponseModerationProps {
  responses: ReviewResponseWithDetails[];
  onModerate: (responseId: string, status: ResponseStatus, notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export interface ResponseAnalyticsProps {
  analytics: ResponseAnalyticsResponse['data'];
  filters?: ResponseAnalyticsFilters;
  onFilterChange?: (filters: ResponseAnalyticsFilters) => void;
}

export interface ResponseGuidelinesProps {
  guidelines: ResponseGuidelinesResponse['data'];
  onClose: () => void;
}

// Filter interfaces
export interface ResponseAnalyticsFilters {
  date_from?: string;
  date_to?: string;
  status?: ResponseStatus;
  responder_id?: string;
  review_id?: string;
  min_engagement_score?: number;
}

export interface ResponseListFilters {
  status?: ResponseStatus;
  responder_id?: string;
  review_id?: string;
  date_from?: string;
  date_to?: string;
}

// Pagination interface
export interface ResponsePagination {
  limit: number;
  offset: number;
  has_more: boolean;
  total?: number;
}

// Hook return types
export interface UseReviewResponsesReturn {
  responses: ReviewResponseWithDetails[];
  isLoading: boolean;
  isMutating?: boolean;
  error: string | null;
  createResponse: (data: CreateReviewResponseRequest) => Promise<void>;
  updateResponse: (responseId: string, data: UpdateReviewResponseRequest) => Promise<void>;
  deleteResponse: (responseId: string) => Promise<void>;
  voteOnResponse: (data: VoteResponseRequest) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseResponseModerationReturn {
  pendingResponses: ReviewResponseWithDetails[];
  isLoading: boolean;
  error: string | null;
  moderateResponse: (responseId: string, status: ResponseStatus, notes?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface UseResponseAnalyticsReturn {
  analytics: ResponseAnalyticsResponse['data'] | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (filters?: ResponseAnalyticsFilters) => Promise<void>;
}

// Form validation interfaces
export interface ResponseFormData {
  content: string;
}

export interface ResponseFormErrors {
  content?: string;
  general?: string;
}

// UI State interfaces
export interface ResponseUIState {
  isCreating: boolean;
  isEditing: string | null;
  isDeleting: string | null;
  isVoting: string | null;
  showGuidelines: boolean;
  selectedResponse: ReviewResponseWithDetails | null;
}

// Constants
export const RESPONSE_VALIDATION = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 2000,
  OPTIMAL_MIN_LENGTH: 50,
  OPTIMAL_MAX_LENGTH: 500
} as const;

export const RESPONSE_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  flagged: 'Flagged for Review'
} as const;

export const RESPONSE_STATUS_COLORS = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  flagged: 'orange'
} as const;

// Error codes
export enum ReviewResponseErrorCodes {
  RESPONSE_NOT_FOUND = 'RESPONSE_NOT_FOUND',
  RESPONSE_ALREADY_EXISTS = 'RESPONSE_ALREADY_EXISTS',
  RESPONSE_TOO_SHORT = 'RESPONSE_TOO_SHORT',
  RESPONSE_TOO_LONG = 'RESPONSE_TOO_LONG',
  RESPONSE_CONTAINS_PROHIBITED_CONTENT = 'RESPONSE_CONTAINS_PROHIBITED_CONTENT',
  RESPONSE_NOT_PENDING = 'RESPONSE_NOT_PENDING',
  UNAUTHORIZED_TO_RESPOND = 'UNAUTHORIZED_TO_RESPOND',
  UNAUTHORIZED_TO_MODERATE = 'UNAUTHORIZED_TO_MODERATE',
  MODERATION_FAILED = 'MODERATION_FAILED',
  ANALYTICS_UNAVAILABLE = 'ANALYTICS_UNAVAILABLE',
  VOTE_ALREADY_EXISTS = 'VOTE_ALREADY_EXISTS',
  INVALID_VOTE_TYPE = 'INVALID_VOTE_TYPE'
}

// Utility types
export type ResponseAction = 'create' | 'update' | 'delete' | 'vote' | 'moderate';
export type ResponseSortField = 'created_at' | 'updated_at' | 'engagement_score' | 'helpful_votes';
export type ResponseSortOrder = 'asc' | 'desc';

export interface ResponseSortOptions {
  field: ResponseSortField;
  order: ResponseSortOrder;
}
