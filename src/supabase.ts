import { createClient } from '@supabase/supabase-js';

// --- ÁREA DE CONFIGURAÇÃO (Hardcode) ---
// Substitua o texto entre aspas pelas suas credenciais do Supabase
// Não deixe espaços em branco antes ou depois da chave!

// Substitua as linhas fixas por isso:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mantenha o resto da verificação abaixo, mas garanta que ela usa essas variáveis acima.
// ---------------------------------------

console.log("--- DEBUG DE CONEXÃO ---");
console.log("Tentando conectar em:", SUPABASE_URL);

if (!SUPABASE_URL || SUPABASE_URL.includes("SUA_URL")) {
  console.error("ERRO CRÍTICO: As chaves do Supabase não foram configuradas!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});