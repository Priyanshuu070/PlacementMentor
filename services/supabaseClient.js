import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if the URL and key are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  throw new Error('Missing Supabase environment variables. Make sure you have a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY defined.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// In Next.js, environment variables that need to be accessible in the browser (client-side) must start with NEXT_PUBLIC_. Otherwise, they will only be available on the server side.