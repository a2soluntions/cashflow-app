import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a single supabase client with cache-busting headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
    fetch: (url, options = {}) => {
      // Adiciona timestamp para evitar cache do navegador em GET requests
      const separator = String(url).includes('?') ? '&' : '?';
      const bustUrl = `${url}${separator}_t=${Date.now()}`;
      return fetch(bustUrl, { ...options, cache: 'no-store' });
    }
  }
});