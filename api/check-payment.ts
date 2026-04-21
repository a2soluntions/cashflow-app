// api/check-payment.ts — Vercel Serverless Function
// Polling: verifica status de um pagamento no Mercado Pago

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get('payment_id');

  if (!paymentId) {
    return new Response(JSON.stringify({ error: 'payment_id obrigatório' }), { status: 400 });
  }

  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Token não configurado' }), { status: 500 });
  }

  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ status: 'error' }), { status: 502 });
    }

    const data = await res.json();

    return new Response(JSON.stringify({
      status: data.status, // 'pending' | 'approved' | 'rejected' | 'cancelled'
      status_detail: data.status_detail,
      payment_id: data.id,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
