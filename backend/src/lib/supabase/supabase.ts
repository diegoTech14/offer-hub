import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Log for debugging (will remove after fixing)
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE CONFIGURATION ERROR:');
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  console.error('All env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
}

export const supabase = createClient(supabaseUrl, supabaseKey)
