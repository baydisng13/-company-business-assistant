import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is not set. Supabase client might not work as expected for non-DB features.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
