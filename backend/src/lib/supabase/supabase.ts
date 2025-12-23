import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Get Supabase client instance
 * Validates environment variables and creates configured client
 * @throws Error if required environment variables are missing
 */
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing SUPABASE_URL environment variable. ' +
      'Please set it in your .env file.'
    );
  }

  if (!supabaseKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'Please set it in your .env file.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid SUPABASE_URL format: ${supabaseUrl}. ` +
      'Must be a valid URL (e.g., https://your-project.supabase.co)'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Export singleton instance
export const supabase = createSupabaseClient();
