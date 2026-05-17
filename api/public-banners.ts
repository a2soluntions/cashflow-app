// api/public-banners.ts — Vercel Serverless Function
// Busca banners e conteúdo público do site_content server-side
// Usa VITE_ vars como fallback para compatibilidade com Vercel

export const config = { runtime: 'nodejs' };

// A anon key é segura para ser exposta publicamente (só permite SELECT em tabelas públicas)
const SUPABASE_URL = 'https://fhjdymzjikjnyafadhim.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamR5bXpqaWtqbnlhZmFkaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mjc2NjUsImV4cCI6MjA5MjIwMzY2NX0.7qQAYfwddqaDO7ywZUeSELs1UDzPFa3F1hwlVNOvNrs';

export default async function handler(req: Request) {

  try {
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    // Busca banners
    const bannersRes = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?content_type=in.(home_banner_left,home_banner_right)&is_active=eq.true&select=id,content_type,image_url,title,meta_value`,
      { headers }
    );
    const banners = bannersRes.ok ? await bannersRes.json() : [];

    // Busca notícias recentes
    const newsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?content_type=in.(news,marketing)&is_active=eq.true&order=created_at.desc&limit=4&select=id,title,description,image_url,meta_value`,
      { headers }
    );
    const news = newsRes.ok ? await newsRes.json() : [];

    console.log(`[public-banners] OK — banners: ${banners.length}, news: ${news.length}`);

    return new Response(JSON.stringify({ banners, news }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    console.error('[public-banners] Error:', err.message);
    return new Response(JSON.stringify({ banners: [], news: [], error: err.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
