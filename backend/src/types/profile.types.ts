/**
 * @fileoverview Profile type definitions
 * @author Offer Hub Team
 */

export interface Profile {
  id: string;
  user_id: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  location?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  skills?: string[] | null;
  portfolio_items?: any[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProfileDTO {
  user_id: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  location?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  skills?: string[] | null;
  portfolio_items?: any[] | null;
}

export interface UpdateProfileDTO {
  avatar_url?: string | null;
  banner_url?: string | null;
  location?: string | null;
  website?: string | null;
  twitter?: string | null;
  github?: string | null;
  linkedin?: string | null;
  skills?: string[] | null;
  portfolio_items?: any[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}