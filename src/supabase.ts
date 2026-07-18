import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client with safe cache-busting on GET requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    fetch: (url, options = {}) => {
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        return fetch(url, { ...options, cache: 'no-store' });
      }
      return fetch(url, options);
    }
  }
});