// This file handles Supabase client configuration.
// To configure your own Supabase project, update the values in the .env file:
// - VITE_SUPABASE_URL: Your Supabase project URL
// - VITE_SUPABASE_PUBLISHABLE_KEY: Your Supabase anon key
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuration using environment variables, making it easy to customize for different projects
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL) {
  console.error('Missing SUPABASE_URL environment variable');
}

if (!SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_ANON_KEY environment variable (VITE_SUPABASE_PUBLISHABLE_KEY)');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});