import { useState, useEffect, useCallback } from 'react';
import { 
  ReviewResponseWithDetails, 
  CreateReviewResponseRequest, 
  UpdateReviewResponseRequest, 
  VoteResponseRequest,
  UseReviewResponsesReturn,
  ReviewResponseAPIResponse,
  ReviewResponseErrorCodes
} from '@/types/review-responses.types';

// API base URL - adjust based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useReviewResponses = (reviewId: string): UseReviewResponsesReturn => {
  const [responses, setResponses] = useState<ReviewResponseWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch responses for a review
  const fetchResponses = useCallback(async () => {
    if (!reviewId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<ReviewResponseAPIResponse>(`/api/reviews/${reviewId}/responses`);
      if (data.success && 'data' in data) {
        setResponses((data as any).data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch responses');
    } finally {
      setIsLoading(false);
    }
  }, [reviewId]);

  // Create a new response
  const createResponse = useCallback(async (data: CreateReviewResponseRequest) => {
    setIsMutating(true);
    setError(null);
    
    try {
      const response = await apiRequest<ReviewResponseAPIResponse>('/api/reviews/responses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.success && 'data' in response) {
        // Refresh the responses list
        await fetchResponses();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create response');
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [fetchResponses]);

  // Update an existing response
  const updateResponse = useCallback(async (responseId: string, data: UpdateReviewResponseRequest) => {
    setIsMutating(true);
    setError(null);
    
    try {
      const response = await apiRequest<ReviewResponseAPIResponse>(`/api/responses/${responseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (response.success && 'data' in response) {
        // Update the response in the local state
        setResponses(prev => prev.map(r => 
          r.id === responseId 
            ? { ...r, ...response.data, updated_at: new Date().toISOString() }
            : r
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update response');
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  // Delete a response
  const deleteResponse = useCallback(async (responseId: string) => {
    setIsMutating(true);
    setError(null);
    
    try {
      await apiRequest<ReviewResponseAPIResponse>(`/api/responses/${responseId}`, {
        method: 'DELETE',
      });
      
      // Remove the response from local state
      setResponses(prev => prev.filter(r => r.id !== responseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete response');
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  // Vote on a response
  const voteOnResponse = useCallback(async (data: VoteResponseRequest) => {
    setIsMutating(true);
    setError(null);
    
    try {
      const response = await apiRequest<ReviewResponseAPIResponse>(`/api/responses/${data.response_id}/vote`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (response.success && 'data' in response) {
        // Update the analytics in local state
        setResponses(prev => prev.map(r => 
          r.id === data.response_id 
            ? {
                ...r,
                analytics: {
                  ...r.analytics,
                  helpful_votes: (response as any).data.total_helpful,
                  unhelpful_votes: (response as any).data.total_unhelpful,
                }
              }
            : r
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote on response');
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  // Refetch responses
  const refetch = useCallback(async () => {
    await fetchResponses();
  }, [fetchResponses]);

  // Load responses on mount
  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  return {
    responses,
    isLoading,
    isMutating,
    error,
    createResponse,
    updateResponse,
    deleteResponse,
    voteOnResponse,
    refetch,
  };
};

// Hook for getting response guidelines
export const useResponseGuidelines = () => {
  const [guidelines, setGuidelines] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidelines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest<ReviewResponseAPIResponse>('/api/responses/guidelines');
      if (data.success && 'data' in data) {
        setGuidelines(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch guidelines');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuidelines();
  }, [fetchGuidelines]);

  return {
    guidelines,
    isLoading,
    error,
    refetch: fetchGuidelines,
  };
};

// Hook for response validation
export const useResponseValidation = () => {
  const validateContent = useCallback((content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!content || content.trim().length === 0) {
      errors.push('Response content is required');
    } else if (content.trim().length < 10) {
      errors.push('Response must be at least 10 characters long');
    } else if (content.length > 2000) {
      errors.push('Response must be less than 2000 characters');
    }
    
    // Check for prohibited content
    const prohibitedWords = ['spam', 'fake', 'scam', 'harassment'];
    const lowerContent = content.toLowerCase();
    const foundProhibited = prohibitedWords.find(word => lowerContent.includes(word));
    
    if (foundProhibited) {
      errors.push('Response contains prohibited content');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const getQualityScore = useCallback((content: string): number => {
    let score = 50; // Base score
    
    // Length scoring
    if (content.length >= 50 && content.length <= 500) {
      score += 20; // Optimal length
    } else if (content.length < 50) {
      score += 10; // Too short
    } else if (content.length > 1000) {
      score -= 10; // Too long
    }
    
    // Professional language scoring
    const professionalWords = ['thank', 'appreciate', 'professional', 'improve', 'feedback'];
    const unprofessionalWords = ['hate', 'stupid', 'idiot', 'suck', 'terrible'];
    
    const lowerContent = content.toLowerCase();
    professionalWords.forEach(word => {
      if (lowerContent.includes(word)) score += 5;
    });
    
    unprofessionalWords.forEach(word => {
      if (lowerContent.includes(word)) score -= 15;
    });
    
    return Math.max(0, Math.min(100, score));
  }, []);

  return {
    validateContent,
    getQualityScore,
  };
};
