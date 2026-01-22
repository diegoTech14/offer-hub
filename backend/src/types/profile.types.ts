/**
 * @fileoverview Profile type definitions
 * @author Offer Hub Team
 */

/**
 * Full Profile Entity
 * Represents a complete profile record from the database
 */
export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  date_of_birth: Date | null;
  location: string | null;
  skills: string[];
  website: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create Profile DTO (Data Transfer Object)
 * Used when creating a new profile
 * Excludes auto-generated fields: id, created_at, updated_at
 */
export interface CreateProfileDTO {
  user_id: string;
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  date_of_birth?: Date | null;
  location?: string | null;
  skills?: string[];
  website?: string | null;
}

/**
 * Update Profile DTO (Data Transfer Object)
 * Used when updating an existing profile
 * All fields are optional except those used for identification
 */
export interface UpdateProfileDTO {
  display_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  date_of_birth?: Date | null;
  location?: string | null;
  skills?: string[];
  website?: string | null;
}

/**
 * Profile validation constraints
 */
export const ProfileConstraints = {
  DISPLAY_NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  LOCATION_MAX_LENGTH: 100,
  WEBSITE_MAX_LENGTH: 255,
} as const;

/**
 * Type guard to check if an object is a valid Profile
 */
export function isProfile(obj: any): obj is Profile {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.user_id === "string" &&
    (obj.display_name === null || typeof obj.display_name === "string") &&
    (obj.bio === null || typeof obj.bio === "string") &&
    (obj.avatar_url === null || typeof obj.avatar_url === "string") &&
    (obj.date_of_birth === null || obj.date_of_birth instanceof Date) &&
    (obj.location === null || typeof obj.location === "string") &&
    Array.isArray(obj.skills) &&
    (obj.website === null || typeof obj.website === "string") &&
    obj.created_at instanceof Date &&
    obj.updated_at instanceof Date
  );
}

/**
 * Type guard to check if an object is a valid CreateProfileDTO
 */
export function isCreateProfileDTO(obj: any): obj is CreateProfileDTO {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.user_id === "string" &&
    (obj.display_name === undefined ||
      obj.display_name === null ||
      typeof obj.display_name === "string") &&
    (obj.bio === undefined ||
      obj.bio === null ||
      typeof obj.bio === "string") &&
    (obj.avatar_url === undefined ||
      obj.avatar_url === null ||
      typeof obj.avatar_url === "string") &&
    (obj.date_of_birth === undefined ||
      obj.date_of_birth === null ||
      obj.date_of_birth instanceof Date) &&
    (obj.location === undefined ||
      obj.location === null ||
      typeof obj.location === "string") &&
    (obj.skills === undefined || Array.isArray(obj.skills)) &&
    (obj.website === undefined ||
      obj.website === null ||
      typeof obj.website === "string")
  );
}

/**
 * Type guard to check if an object is a valid UpdateProfileDTO
 */
export function isUpdateProfileDTO(obj: any): obj is UpdateProfileDTO {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (obj.display_name === undefined ||
      obj.display_name === null ||
      typeof obj.display_name === "string") &&
    (obj.bio === undefined ||
      obj.bio === null ||
      typeof obj.bio === "string") &&
    (obj.avatar_url === undefined ||
      obj.avatar_url === null ||
      typeof obj.avatar_url === "string") &&
    (obj.date_of_birth === undefined ||
      obj.date_of_birth === null ||
      obj.date_of_birth instanceof Date) &&
    (obj.location === undefined ||
      obj.location === null ||
      typeof obj.location === "string") &&
    (obj.skills === undefined || Array.isArray(obj.skills)) &&
    (obj.website === undefined ||
      obj.website === null ||
      typeof obj.website === "string")
  );
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}