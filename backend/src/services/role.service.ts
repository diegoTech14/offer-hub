/**
 * @fileoverview Role service providing role switching functionality
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { NotFoundError, InternalServerError } from "@/utils/AppError";

/**
 * User data returned from role switching operations
 */
export interface UserWithRole {
  id: string;
  email: string | null;
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_freelancer: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Set user's is_freelancer flag to true
 * Updates the user's role to freelancer and updates the updated_at timestamp
 * 
 * @param userId - UUID of the user to update
 * @returns Updated user data with is_freelancer set to true
 * @throws NotFoundError if user does not exist
 * @throws InternalServerError if database update fails
 */
export async function becomeFreelancer(userId: string): Promise<UserWithRole> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (fetchError || !existingUser) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  // Update user to freelancer
  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      is_freelancer: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, username, name, bio, avatar_url, is_freelancer, created_at, updated_at")
    .single();

  if (updateError || !updatedUser) {
    throw new InternalServerError("Failed to update user role", {
      userId,
      error: updateError?.message,
    });
  }

  return updatedUser as UserWithRole;
}

/**
 * Set user's is_freelancer flag to false
 * Updates the user's role to client and updates the updated_at timestamp
 * 
 * @param userId - UUID of the user to update
 * @returns Updated user data with is_freelancer set to false
 * @throws NotFoundError if user does not exist
 * @throws InternalServerError if database update fails
 */
export async function becomeClient(userId: string): Promise<UserWithRole> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (fetchError || !existingUser) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  // Update user to client
  const { data: updatedUser, error: updateError } = await supabase
    .from("users")
    .update({
      is_freelancer: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, email, username, name, bio, avatar_url, is_freelancer, created_at, updated_at")
    .single();

  if (updateError || !updatedUser) {
    throw new InternalServerError("Failed to update user role", {
      userId,
      error: updateError?.message,
    });
  }

  return updatedUser as UserWithRole;
}
