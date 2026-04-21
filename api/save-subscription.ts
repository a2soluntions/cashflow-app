// api/save-subscription.ts — Vercel Serverless Function
// Salva a subscription de push do browser no perfil do usuário

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const method = req.method;

  try {
    const { userId, subscription } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId obrigatório' }), { status: 400 });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: 'Configuração Supabase ausente' }), { status: 500 });
    }

    if (method === 'POST') {
      // Salva a assinatura
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          push_subscription: subscription,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Erro ao salvar no Supabase');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (method === 'DELETE') {
      // Remove a assinatura
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({
          push_subscription: null,
          updated_at: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Erro ao remover do Supabase');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405 });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
