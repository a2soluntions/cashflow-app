// api/create-pix.ts — Vercel Serverless Function
// Cria uma cobrança PIX via Mercado Pago e retorna o QR Code

export const config = { runtime: 'edge' };

const PLANS: Record<string, { amount: number; label: string; days: number }> = {
  monthly: { amount: 19.90, label: 'VittaCash Mensal', days: 30 },
  annual:  { amount: 149.90, label: 'VittaCash Anual',  days: 365 },
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { planId, email, userId } = await req.json();
    const plan = PLANS[planId];

    if (!plan) {
      return new Response(JSON.stringify({ error: 'Plano inválido' }), { status: 400 });
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: 'Token MP não configurado' }), { status: 500 });
    }

    const payload = {
      transaction_amount: plan.amount,
      description: plan.label,
      payment_method_id: 'pix',
      payer: {
        email: email || 'cliente@vittacash.app',
        first_name: 'Cliente',
        last_name: 'VittaCash',
      },
      metadata: {
        user_id: userId,
        plan_id: planId,
        plan_days: plan.days,
      },
      notification_url: 'https://vittacash-ruddy.vercel.app/api/mp-webhook',
    };

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${userId}-${planId}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!mpRes.ok) {
      const err = await mpRes.json();
      console.error('MP Error:', err);
      return new Response(JSON.stringify({ error: 'Erro ao gerar PIX', detail: err }), { status: 502 });
    }

    const data = await mpRes.json();

    return new Response(JSON.stringify({
      payment_id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      plan: { ...plan, id: planId },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message || 'Erro interno' }), { status: 500 });
  }
}
