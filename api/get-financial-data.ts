// api/get-financial-data.ts — Vercel Serverless Function
// Busca Selic, IPCA e Dólar com sistema de cache no Supabase

export const config = { runtime: 'nodejs' };

export default async function handler(req: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Missing environment variables', { status: 500 });
  }

  const results: any = {
    selic: { value: '10.75', symbol: '%' },
    ipca: { value: '4.50', symbol: '%' },
    dolar: { value: '5.45', symbol: 'R$' },
    last_update: new Date().toISOString()
  };

  try {
    // 1. Tenta buscar SELIC (BCB) - Série 11 (Diária anualizada)
    try {
      const resp = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?formato=json');
      const data = await resp.json();
      if (data && data.length > 0) {
        results.selic.value = data[data.length - 1].valor;
      }
    } catch (e) { console.warn('Falha ao buscar SELIC'); }

    // 2. Tenta buscar IPCA (BCB) - Série 433
    try {
      const resp = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json');
      const data = await resp.json();
      if (data && data.length > 0) {
         results.ipca.value = data[data.length - 1].valor;
      }
    } catch (e) { console.warn('Falha ao buscar IPCA'); }

    // 3. Tenta buscar DÓLAR (AwesomeAPI)
    try {
      const resp = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
      const data = await resp.json();
      if (data && data.USDBRL) {
        results.dolar.value = parseFloat(data.USDBRL.bid).toFixed(2);
      }
    } catch (e) { console.warn('Falha ao buscar DÓLAR'); }

    // 4. Salva o sucesso na tabela de cache site_content
    // Nota: Fazemos isso de forma assíncrona sem travar a resposta
    for (const key of ['SELIC', 'IPCA', 'DÓLAR']) {
        const val = key === 'SELIC' ? results.selic.value : (key === 'IPCA' ? results.ipca.value : results.dolar.value);
        await fetch(`${SUPABASE_URL}/rest/v1/site_content?title=eq.${key}&content_type=eq.indicator`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
                meta_value: { value: val, symbol: key === 'DÓLAR' ? 'R$' : '%' },
                updated_at: new Date().toISOString()
            })
        });
    }

    return new Response(JSON.stringify(results), { status: 200 });

  } catch (err: any) {
    // Caso de falha catastrófica: tenta recuperar o último cache do Banco
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?content_type=eq.indicator`, {
        headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
    });
    const cache = await res.json();
    return new Response(JSON.stringify({ 
        message: 'Returning cached data due to API errors',
        data: cache 
    }), { status: 200 });
  }
}
