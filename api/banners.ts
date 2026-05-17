// api/banners.ts — Standard Serverless Function (Vercel Node.js)
const SUPA_URL = 'https://fhjdymzjikjnyafadhim.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamR5bXpqaWtqbnlhZmFkaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mjc2NjUsImV4cCI6MjA5MjIwMzY2NX0.7qQAYfwddqaDO7ywZUeSELs1UDzPFa3F1hwlVNOvNrs';

export default async function handler(req: any, res: any) {
  // CORS Headers for public access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const fetchSupa = async (url: string) => {
    try {
      const response = await fetch(url, { 
        headers: { 
          'apikey': SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`
        } 
      });
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('Fetch error:', e);
      return [];
    }
  };

  try {
    const ts = Date.now();
    const baseUrl = `${SUPA_URL}/rest/v1/site_content`;
    
    // Fetch all needed content types in one go to be faster
    const allContent: any[] = await fetchSupa(`${baseUrl}?content_type=in.(home_banner_left,home_banner_right,news,marketing)&is_active=eq.true&order=created_at.desc&limit=20&_ts=${ts}`);
    
    const banners = (allContent || []).filter((c: any) => c.content_type.includes('banner'));
    const news = (allContent || []).filter((c: any) => !c.content_type.includes('banner')).slice(0, 4);

    return res.status(200).json({ 
      banners: banners || [], 
      news: news || [],
      count: banners.length,
      ts
    });
  } catch (e: any) {
    return res.status(200).json({ error: e.message, banners: [], news: [] });
  }
}
