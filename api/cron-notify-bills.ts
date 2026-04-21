// api/cron-notify-bills.ts — Vercel Serverless Function / Cron Job
// Verifica contas vencendo hoje e envia notificações push

import webpush from 'web-push';

export const config = {
  // Edge runtime não suporta bibliotecas de crypto nativas complexas em alguns casos, 
  // mas o web-push costuma funcionar no Node runtime padrão da Vercel.
  runtime: 'nodejs', 
};

export default async function handler(req: Request) {
  // Opcional: Proteger com Token Secreto se for cron real
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return new Response('Unauthorized', { status: 401 });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
  const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@vittacash.app';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response('Missing environment variables', { status: 500 });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Busca transações pendentes para HOJE
    // Nota: Filtramos no JS para simplificar o fetch sem dependência de lib Supabase na API Edge/Node
    const txsRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?status=eq.PENDING&date=eq.${today}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const transactions = await txsRes.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhuma conta vencendo hoje.' }), { status: 200 });
    }

    // 2. Busca perfis que têm push_subscription ativo
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?push_subscription=not.is.null`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const profiles = await profRes.json();

    const results = [];

    // 3. Processa e envia os pushes
    for (const tx of transactions) {
      const userProfile = profiles.find((p: any) => p.user_id === tx.user_id);
      
      if (userProfile && userProfile.push_subscription) {
        const payload = JSON.stringify({
          title: 'Vencimento Hoje 🔔',
          body: `${tx.description}: R$ ${tx.amount.toFixed(2).replace('.', ',')}`,
          url: '/?tab=contas'
        });

        try {
          await webpush.sendNotification(userProfile.push_subscription, payload);
          results.push({ userId: tx.user_id, success: true });
        } catch (err: any) {
          console.error(`Erro ao enviar para ${tx.user_id}:`, err);
          results.push({ userId: tx.user_id, success: false, error: err.message });
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Processamento concluído', 
      notifiedCount: results.filter(r => r.success).length,
      details: results 
    }), { status: 200 });

  } catch (err: any) {
    console.error('Erro no Cron:', err);
    return new Response(err.message, { status: 500 });
  }
}
