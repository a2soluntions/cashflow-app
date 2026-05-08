// api/kiwify-webhook.ts — Vercel Serverless Function
// Recebe notificações da Kiwify e ativa assinatura no Supabase

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const signature = req.headers.get('x-kiwify-signature');
    const token = process.env.KIWIFY_WEBHOOK_TOKEN;

    // Se o token estiver configurado, podemos validar a assinatura. (Opcional, mas recomendado)
    // Para simplificar a integração imediata, vamos apenas verificar um token na query string ou aceitar o body.
    // Em produção, você ativará o token na Kiwify.
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');
    
    if (token && queryToken !== token) {
      console.error('Token inválido fornecido no Webhook');
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    console.log('Kiwify Webhook recebido:', JSON.stringify(body));

    const status = body.order_status; // "paid", "approved", "refunded", etc.
    if (status !== 'paid' && status !== 'approved') {
      console.log(`Pedido ignorado. Status: ${status}`);
      return new Response('OK', { status: 200 });
    }

    const email = body.customer?.email || body.Customer?.email;
    const productName = (body.product_name || body.Product?.product_name || '').toLowerCase();
    
    if (!email) {
      console.error('Email do cliente não encontrado no webhook');
      return new Response('OK', { status: 200 });
    }

    // Determinar o plano baseado no nome do produto
    let planId = 'free';
    let planDays = 30; // Padrão mensal

    if (productName.includes('premium')) {
      planId = 'premium';
      planDays = 30;
    } else if (productName.includes('básico') || productName.includes('basico')) {
      planId = 'basic';
      planDays = 30;
    } else if (productName.includes('vitalícia') || productName.includes('desktop') || productName.includes('vitalicio')) {
      planId = 'desktop';
      planDays = 36500; // 100 anos (vitalício)
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('Variáveis de ambiente do Supabase faltando');
      return new Response('Config error', { status: 500 });
    }

    // 1. Convidar usuário (ou criar). A API Admin envia o e-mail de convite para definir a senha.
    const inviteRes = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        data: { full_name: `${body.customer?.first_name || ''} ${body.customer?.last_name || ''}`.trim() }
      }),
    });

    let userId = null;

    if (inviteRes.ok) {
      const inviteData = await inviteRes.json();
      userId = inviteData.user?.id || inviteData.id;
      console.log(`Usuário convidado com sucesso: ${email} (ID: ${userId})`);
    } else {
      // Se falhou, pode ser que o usuário já exista.
      const errorText = await inviteRes.text();
      console.log('Falha ao convidar (pode já existir):', errorText);
      
      // Busca o usuário existente pela REST API
      const searchRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=user_id`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        }
      });
      
      if (searchRes.ok) {
        const users = await searchRes.json();
        if (users.length > 0) {
          userId = users[0].user_id;
          console.log(`Usuário existente encontrado: ${email} (ID: ${userId})`);
        }
      }
    }

    if (!userId) {
      console.error('Não foi possível obter ou criar o userId para o email:', email);
      return new Response('Error creating user', { status: 500 });
    }

    // 2. Calcular expiração
    const expiresAt = new Date(Date.now() + planDays * 24 * 60 * 60 * 1000).toISOString();

    // 3. Atualiza o perfil no Supabase
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
        subscription_tier: planId,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Erro ao atualizar plano no Supabase:', errText);
      return new Response('Supabase update error', { status: 500 });
    }

    // 4. Registrar a venda na tabela `licenses` para aparecer no Centro de Vendas
    const priceMap: Record<string, number> = {
      'free':    0,
      'basic':   19.90,
      'premium': 59.90,
      'desktop': 497.00,
    };

    const licenseKey = 'VITTA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const clientFullName = `${body.customer?.first_name || body.Customer?.first_name || ''} ${body.customer?.last_name || body.Customer?.last_name || ''}`.trim() || email;

    const licenseRes = await fetch(`${SUPABASE_URL}/rest/v1/licenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        key: licenseKey,
        client_name: clientFullName,
        status: 'active',
        price: priceMap[planId] ?? 0,
        origin: 'Kiwify',
        product_type: planId === 'desktop' ? 'Desktop' : 'SaaS',
      }),
    });

    if (!licenseRes.ok) {
      // Não fatal — acesso já foi liberado. Apenas logamos o erro.
      const licErr = await licenseRes.text();
      console.warn('⚠️ Venda não registrada em licenses:', licErr);
    } else {
      console.log(`📋 Venda registrada em licenses: ${clientFullName} | ${planId} | Chave: ${licenseKey}`);
    }

    console.log(`✅ Acesso liberado com sucesso: user=${userId} plano=${planId}`);
    return new Response('OK', { status: 200 });


  } catch (err: any) {
    console.error('Erro geral no webhook da Kiwify:', err);
    return new Response('ERROR', { status: 500 });
  }
}
