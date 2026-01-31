"use client";

import { useState, useCallback } from 'react';
import { 
  User, 
  UpdateUserDTO, 
  ProfileResponse, 
  UpdateProfileResponse, 
  ProfileError,
  ProfileFormData 
} from '@/types/user.types';

interface UseProfileApiReturn {
  user: User | null;
  isLoading: boolean;
  error: ProfileError | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, data: UpdateUserDTO) => Promise<boolean>;
  clearError: () => void;
}

// Mock user data
const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Olivia Rhye",
  username: "olivia_rhye",
  email: "olivia@example.com",
  bio: "Full-stack developer with 5+ years of experience in React, Node.js, and blockchain technologies.",
  wallet_address: "0x030rZ...0YeH",
  avatar_url: "/person1.png",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  role: "user",
  profile_completed: true,
  email_verified: true,
  two_factor_enabled: false,
  last_login: new Date().toISOString(),
  location: "San Francisco, CA",
  timezone: "America/Los_Angeles",
  languages: ["English", "Spanish"],
  skills: ["React", "Node.js", "TypeScript", "Solidity", "Web3"],
  experience_level: "Senior",
  hourly_rate: 75,
  availability: "Available",
  portfolio_url: "https://portfolio.olivia.com",
  linkedin_url: "https://linkedin.com/in/olivia-rhye",
  github_url: "https://github.com/olivia-rhye",
  website_url: "https://olivia.com",
  social_media: {
    twitter: "https://twitter.com/olivia_rhye",
    instagram: "https://instagram.com/olivia_rhye"
  },
  preferences: {
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    profile_visibility: "public"
  },
  statistics: {
    total_projects: 24,
    completed_projects: 22,
    success_rate: 92,
    total_earnings: 125000,
    rating: 4.8,
    reviews_count: 18
  }
};

export function useProfileApiMock(): UseProfileApiReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ProfileError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!userId) {
      setError({ message: 'User ID is required', code: 'MISSING_USER_ID' });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response
      const mockResponse: ProfileResponse = {
        success: true,
        data: mockUser,
        message: 'Profile fetched successfully'
      };

      setUser(mockResponse.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError({ 
        message: errorMessage,
        code: 'FETCH_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updateData: UpdateUserDTO): Promise<boolean> => {
    if (!userId) {
      setError({ message: 'User ID is required', code: 'MISSING_USER_ID' });
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock successful update
      const updatedUser = { ...mockUser, ...updateData, updated_at: new Date().toISOString() };
      
      const mockResponse: UpdateProfileResponse = {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };

      setUser(mockResponse.data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError({ 
        message: errorMessage,
        code: 'UPDATE_ERROR'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError,
  };
}

// Helper function to map frontend form data to backend update format
export function mapFormDataToUpdateDTO(formData: ProfileFormData): UpdateUserDTO {
  return {
    name: formData.name.trim() || undefined,
    username: formData.username.trim() || undefined,
    email: formData.email.trim() || undefined,
    bio: formData.bio.trim() || undefined,
  };
}

// Helper function to split name for display purposes
export function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName?.trim()) {
    return { firstName: '', lastName: '' };
  }
  
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  
  return { firstName, lastName };
}

// Helper function to combine names
export function combineName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
