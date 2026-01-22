
/**
 * Full Profile Entity
 * Represents a complete profile record from the database
 */
export interface Profile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  location: string | null;
  skills: string[];
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Profile DTO (Data Transfer Object)
 * Used when creating a new profile
 * Excludes auto-generated fields: id, createdAt, updatedAt
 */
export interface CreateProfileDTO {
  userId: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: Date | null;
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
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: Date | null;
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
    typeof obj.userId === "string" &&
    (obj.displayName === null || typeof obj.displayName === "string") &&
    (obj.bio === null || typeof obj.bio === "string") &&
    (obj.avatarUrl === null || typeof obj.avatarUrl === "string") &&
    (obj.dateOfBirth === null || obj.dateOfBirth instanceof Date) &&
    (obj.location === null || typeof obj.location === "string") &&
    Array.isArray(obj.skills) &&
    (obj.website === null || typeof obj.website === "string") &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

/**
 * Type guard to check if an object is a valid CreateProfileDTO
 */
export function isCreateProfileDTO(obj: any): obj is CreateProfileDTO {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.userId === "string" &&
    (obj.displayName === undefined ||
      obj.displayName === null ||
      typeof obj.displayName === "string") &&
    (obj.bio === undefined ||
      obj.bio === null ||
      typeof obj.bio === "string") &&
    (obj.avatarUrl === undefined ||
      obj.avatarUrl === null ||
      typeof obj.avatarUrl === "string") &&
    (obj.dateOfBirth === undefined ||
      obj.dateOfBirth === null ||
      obj.dateOfBirth instanceof Date) &&
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
    (obj.displayName === undefined ||
      obj.displayName === null ||
      typeof obj.displayName === "string") &&
    (obj.bio === undefined ||
      obj.bio === null ||
      typeof obj.bio === "string") &&
    (obj.avatarUrl === undefined ||
      obj.avatarUrl === null ||
      typeof obj.avatarUrl === "string") &&
    (obj.dateOfBirth === undefined ||
      obj.dateOfBirth === null ||
      obj.dateOfBirth instanceof Date) &&
    (obj.location === undefined ||
      obj.location === null ||
      typeof obj.location === "string") &&
    (obj.skills === undefined || Array.isArray(obj.skills)) &&
    (obj.website === undefined ||
      obj.website === null ||
      typeof obj.website === "string")
  );
}
