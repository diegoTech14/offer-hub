/**
 * @fileoverview fileoverview Profile service providing profile data management and database operations
 * @author Offer Hub Team
 */
import { CreateProfileDTO, Profile } from "@/types/profile.types";
import { AppError } from "@/utils/AppError";
import { supabase } from "@/lib/supabase/supabase";
import { InternalServerError } from "@/utils/AppError";

class ProfileService {
  /**
   * Create a new profile for the authenticated user
   *
   * @returns The created Profile object or null if creation failed
   */
  async createProfile(data: CreateProfileDTO): Promise<Profile | void> {
    // Check if user already exists
    const { data: existingProfile, error } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", data.userId)
      .single();

    if (existingProfile) {
      throw new AppError("Your profile has already been created", 409);
    }

    if (error && error.code !== "PGRST116") {
      throw new AppError(
        "Failed to check existing profile: " + error.message,
        500,
      );
    }

    // Insert new profile
    const { data: profileData, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          user_id: data.userId,
          display_name: data.displayName,
          bio: data.bio,
          website: data.website,
          skills: data.skills,
          date_of_birth: data.dateOfBirth,
          location: data.location,
        },
      ])
      .select()
      .single<Profile>();

    if (insertError) {
      throw new AppError(
        "Failed to create profile: " + insertError.message,
        500,
      );
    }

    return profileData;
  }

  /**
   * Get profile by user ID
   * @param userId - User ID to fetch profile for
   * @returns Profile data or null if not found
   */
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("userId", userId)
        .single();

      if (error) {
        // Return null if profile not found (PGRST116 is "not found" error)
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      // If it's a "not found" error, return null
      if (error.code === "PGRST116") {
        return null;
      }
      throw new InternalServerError(
        `Failed to fetch profile: ${error.message}`,
      );
    }
  }
}

export const profileService = new ProfileService();
