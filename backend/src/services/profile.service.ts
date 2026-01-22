/**
 * @fileoverview Profile service providing profile data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "../lib/supabase/supabase";
import { InternalServerError } from "../utils/AppError";
import { Profile } from "../types/profile.types";

class ProfileService {
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
      throw new InternalServerError(`Failed to fetch profile: ${error.message}`);
    }
  }
}

export const profileService = new ProfileService();