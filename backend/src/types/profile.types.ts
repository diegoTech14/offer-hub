/**
 * @fileoverview Profile type definitions
 * @author Offer Hub Team
 */

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  portfolio_items?: any[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProfileDTO {
  user_id: string;
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  portfolio_items?: any[];
}

export interface UpdateProfileDTO {
  avatar_url?: string;
  banner_url?: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  portfolio_items?: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}