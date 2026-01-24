/**
 * Supabase Database Types
 *
 * These types will be auto-generated from your Supabase schema.
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
 *
 * For now, we use a placeholder type. Update this once you have your schema set up.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Tables will be defined here after schema is created
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
