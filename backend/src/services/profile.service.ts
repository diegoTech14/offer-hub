/**
 * @fileoverview Profile service providing profile data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { AppError, NotFoundError, InternalServerError, BadRequestError } from "@/utils/AppError";
import { UpdateProfileDTO, Profile, ProfileConstraints } from "@/types/profile.types";

class ProfileService {
  /**
   * Get profile by user ID
   * @param userId - The user ID to fetch profile for
   * @returns Profile or null if not found
   */
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no rows found, return null
      if (error.code === "PGRST116") {
        return null;
      }
      throw new InternalServerError(`Failed to fetch profile: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    // Map database columns (snake_case) to Profile interface (camelCase)
    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      location: data.location,
      skills: data.skills || [],
      website: data.website,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Update profile by user ID
   * @param userId - The user ID whose profile to update
   * @param updateData - The update data (UpdateProfileDTO)
   * @returns Updated profile
   */
  async updateProfile(userId: string, updateData: UpdateProfileDTO): Promise<Profile> {
    // Validate profile exists
    const existingProfile = await this.getProfileByUserId(userId);
    if (!existingProfile) {
      throw new NotFoundError("Profile not found", "PROFILE_NOT_FOUND");
    }

    // Protect user_id and id from modification
    if ("userId" in updateData || "id" in updateData) {
      throw new BadRequestError("Cannot update user_id or id fields", "RESTRICTED_FIELD_UPDATE");
    }

    // Prepare update payload - convert camelCase to snake_case and handle empty strings
    const updatePayload: Record<string, any> = {};

    if (updateData.displayName !== undefined) {
      updatePayload.display_name = updateData.displayName === "" ? null : updateData.displayName;
    }

    if (updateData.bio !== undefined) {
      updatePayload.bio = updateData.bio === "" ? null : updateData.bio;
    }

    if (updateData.avatarUrl !== undefined) {
      updatePayload.avatar_url = updateData.avatarUrl === "" ? null : updateData.avatarUrl;
    }

    if (updateData.dateOfBirth !== undefined) {
      updatePayload.date_of_birth = updateData.dateOfBirth === null ? null : updateData.dateOfBirth;
    }

    if (updateData.location !== undefined) {
      updatePayload.location = updateData.location === "" ? null : updateData.location;
    }

    if (updateData.skills !== undefined) {
      updatePayload.skills = updateData.skills;
    }

    if (updateData.website !== undefined) {
      updatePayload.website = updateData.website === "" ? null : updateData.website;
    }

    // Update the profile - updated_at is automatically updated by database trigger
    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new InternalServerError(`Failed to update profile: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError("Profile not found after update", "PROFILE_NOT_FOUND");
    }

    // Map database columns (snake_case) to Profile interface (camelCase)
    return {
      id: data.id,
      userId: data.user_id,
      displayName: data.display_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : null,
      location: data.location,
      skills: data.skills || [],
      website: data.website,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const profileService = new ProfileService();
