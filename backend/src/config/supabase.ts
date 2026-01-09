import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from './logger';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

export const isSupabaseConfigured = (): boolean => {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
};
