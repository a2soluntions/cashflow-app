import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client with safe cache-busting on GET requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      const method = (options.method || 'GET').toUpperCase();
      if (method === 'GET') {
        const separator = String(url).includes('?') ? '&' : '?';
        const bustUrl = `${url}${separator}_t=${Date.now()}`;
        return fetch(bustUrl, { ...options, cache: 'no-store' });
      }
      return fetch(url, options);
    }
  }
});