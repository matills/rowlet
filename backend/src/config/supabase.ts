import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Warn if Supabase is not configured
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_ANON_KEY
) {
  logger.warn(
    '⚠️  Supabase not configured! Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env'
  );
  logger.warn(
    '⚠️  Auth endpoints will not work until Supabase is configured'
  );
}

// Client for user operations (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
};
