/**
 * @fileoverview Profile service allowing authenticated user to create their profile
 * @author Offer Hub Team
 */

import { CreateProfileDTO, Profile } from "@/types/profile.types";
import { supabase } from "@/lib/supabase/supabase";
import { AppError } from "@/utils/AppError";

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
}

export const profileService = new ProfileService();
