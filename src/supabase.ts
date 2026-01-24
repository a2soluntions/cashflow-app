import { createClient } from '@supabase/supabase-js'

// O "import.meta.env" é o jeito do Vite ler as variáveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase (.env.local)')
}

export const supabase = createClient(supabaseUrl, supabaseKey)