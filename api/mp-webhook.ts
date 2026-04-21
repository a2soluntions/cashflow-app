// api/mp-webhook.ts — Vercel Serverless Function
// Recebe notificações do Mercado Pago e ativa assinatura no Supabase

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('OK', { status: 200 }); // MP faz GET de validação
  }

  try {
    const body = await req.json();
    console.log('MP Webhook recebido:', JSON.stringify(body));

    // O Mercado Pago envia: { type: 'payment', data: { id: '...' } }
    if (body.type !== 'payment' || !body.data?.id) {
      return new Response('OK', { status: 200 });
    }

    const paymentId = body.data.id;
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Variáveis de ambiente faltando');
      return new Response('Config error', { status: 500 });
    }

    // 1. Busca detalhes do pagamento no MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const payment = await mpRes.json();

    if (payment.status !== 'approved') {
      console.log(`Pagamento ${paymentId} com status: ${payment.status} — ignorando`);
      return new Response('OK', { status: 200 });
    }

    // 2. Extrai metadados (userId + plano) — gravados em create-pix.ts
    const userId = payment.metadata?.user_id;
    const planDays = parseInt(payment.metadata?.plan_days || '30');
    const planId = payment.metadata?.plan_id || 'monthly';

    if (!userId) {
      console.error('user_id não encontrado nos metadados do pagamento', payment.metadata);
      return new Response('OK', { status: 200 });
    }

    // 3. Calcula expiração da assinatura
    const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();

    // 4. Atualiza perfil no Supabase usando Service Key (bypass no RLS)
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        subscription_status: 'active',
        subscription_plan: planId,
        subscription_expires_at: expiresAt,
        mp_payment_id: String(paymentId),
        updated_at: new Date().toISOString(),
      }),
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Erro ao atualizar assinatura no Supabase:', errText);
      return new Response('Supabase error', { status: 500 });
    }

    console.log(`✅ Assinatura ativada: user=${userId} plano=${planId} expires=${expiresAt}`);
    return new Response('OK', { status: 200 });

  } catch (err: any) {
    console.error('Erro no webhook:', err);
    return new Response('ERROR', { status: 500 });
  }
}
