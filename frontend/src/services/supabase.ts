import { createClient } from '@supabase/supabase-js';

// (import.meta as any) භාවිත කිරීමෙන් TypeScript error එක සම්පූර්ණයෙන්ම විසඳේ
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ioldeccnibwrbnbrvofg.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NVKy8FJJ9BFs0mF38hcJYQ_jHJpAZHa';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);