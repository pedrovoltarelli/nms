import { createClient } from '@supabase/supabase-js';

// =================================================================================
// IMPORTANT: ACTION REQUIRED
// =================================================================================
// To make the application work, you must replace the placeholder values below
// with your actual Supabase project URL and anon key.
//
// You can find these in your Supabase project dashboard under:
// Project Settings (the gear icon) > API
//
// 1. Copy the Project URL and paste it into `supabaseUrl`.
// 2. Copy the Project API Key (the `anon` `public` key) and paste it into `supabaseAnonKey`.
// =================================================================================

// Replace this with your project's API URL
const supabaseUrl = 'https://uwohkozuwubdqzyxgayg.supabase.co';

// Replace this with your project's anon key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3b2hrb3p1d3ViZHF6eXhnYXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MzMyNzIsImV4cCI6MjA3NzUwOTI3Mn0.C4SW_nPGp-eN4_xH3cMemr1xl1B9wmu99hmIBegp6fg';


if (supabaseUrl.includes('YOUR_PROJECT_URL') || supabaseAnonKey.includes('YOUR_ANON_KEY')) {
    console.warn("Supabase is not configured. Please update services/supabase.ts with your project's URL and anon key.");
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);