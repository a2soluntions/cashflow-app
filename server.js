import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;
const DEFAULT_SUPA_URL = 'https://fhjdymzjikjnyafadhim.supabase.co';
const DEFAULT_SUPA_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoamR5bXpqaWtqbnlhZmFkaGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2Mjc2NjUsImV4cCI6MjA5MjIwMzY2NX0.7qQAYfwddqaDO7ywZUeSELs1UDzPFa3F1hwlVNOvNrs';

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Headers de Segurança e CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Health check para monitoramento
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'a2mentor-app',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 1. API: Cotações e Indicadores Financeiros
app.get('/api/get-financial-data', (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json({
    selic: { value: '10.75', symbol: '%' },
    ipca: { value: '4.50', symbol: '%' },
    dolar: { value: '5.45', symbol: 'R$' },
    last_update: new Date().toISOString()
  });
});

// 2. API: Cotação de Ativos B3 via Yahoo Finance
app.get('/api/get-asset-price', async (req, res) => {
  const ticker = req.query.ticker;
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker is required' });
  }
  try {
    const symbol = `${ticker}.SA`.toUpperCase();
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch price' });
    }
    const data = await response.json();
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
    const currency = data.chart?.result?.[0]?.meta?.currency || 'BRL';
    return res.status(200).json({ price, currency, symbol });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. API: Banners Públicos e Conteúdo
const bannersHandler = async (req, res) => {
  try {
    const supaUrl = process.env.SUPABASE_URL || DEFAULT_SUPA_URL;
    const supaKey = process.env.SUPABASE_SERVICE_KEY || DEFAULT_SUPA_KEY;
    const response = await fetch(`${supaUrl}/rest/v1/site_content?key=eq.banners&select=*`, {
      headers: {
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`
      }
    });
    if (!response.ok) {
      return res.status(200).json([]);
    }
    const data = await response.json();
    return res.status(200).json(data?.[0]?.value || data || []);
  } catch (err) {
    return res.status(200).json([]);
  }
};
app.get('/api/banners', bannersHandler);
app.get('/api/public-banners', bannersHandler);

// 4. API: Criar Cobrança PIX Mercado Pago
const PLANS = {
  monthly: { amount: 19.90, label: 'VittaCash Mensal', days: 30 },
  annual:  { amount: 149.90, label: 'VittaCash Anual',  days: 365 },
};

app.post('/api/create-pix', async (req, res) => {
  try {
    const { planId, email, userId } = req.body || {};
    const plan = PLANS[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Plano inválido' });
    }
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Token MP não configurado' });
    }
    const appUrl = process.env.APP_URL || 'https://a2mentor.nx49.com.br';
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
      notification_url: `${appUrl}/api/mp-webhook`,
    };

    const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${userId || 'anon'}-${planId}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!mpRes.ok) {
      const err = await mpRes.json();
      console.error('MP Error:', err);
      return res.status(502).json({ error: 'Erro ao gerar PIX', detail: err });
    }

    const data = await mpRes.json();
    return res.status(200).json({
      payment_id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      plan: { ...plan, id: planId },
    });
  } catch (err) {
    console.error('Erro /api/create-pix:', err);
    return res.status(500).json({ error: err.message || 'Erro interno' });
  }
});

// 5. API: Verificar Status de Pagamento PIX
app.get('/api/check-payment', async (req, res) => {
  const paymentId = req.query.payment_id;
  if (!paymentId) {
    return res.status(400).json({ error: 'payment_id obrigatório' });
  }
  const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Token não configurado' });
  }
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });
    if (!response.ok) {
      return res.status(502).json({ status: 'error' });
    }
    const data = await response.json();
    return res.status(200).json({
      status: data.status,
      status_detail: data.status_detail,
      payment_id: data.id,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 6. API: Webhook Mercado Pago
app.all('/api/mp-webhook', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('OK');
  }
  try {
    const body = req.body || {};
    console.log('MP Webhook recebido:', JSON.stringify(body));
    if (body.type !== 'payment' || !body.data?.id) {
      return res.status(200).send('OK');
    }
    const paymentId = body.data.id;
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPA_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!MP_ACCESS_TOKEN || !SUPABASE_SERVICE_KEY) {
      console.error('MP Webhook: Credenciais ausentes');
      return res.status(200).send('OK');
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
    });
    const payment = await mpRes.json();
    if (payment.status !== 'approved') {
      return res.status(200).send('OK');
    }

    const userId = payment.metadata?.user_id;
    const planDays = parseInt(payment.metadata?.plan_days || '30');
    const planId = payment.metadata?.plan_id || 'monthly';

    if (userId) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + planDays);
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          subscription_plan: planId,
          subscription_expires_at: expDate.toISOString(),
          subscription_status: 'active'
        })
      });
    }
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Erro mp-webhook:', err);
    return res.status(200).send('OK');
  }
});

// 7. API: Webhook Kiwify
app.all('/api/kiwify-webhook', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('OK');
  }
  try {
    const body = req.body || {};
    console.log('Kiwify Webhook recebido:', JSON.stringify(body));
    const status = body.order_status;
    if (status !== 'paid' && status !== 'approved') {
      return res.status(200).send('OK');
    }
    const email = body.customer?.email || body.Customer?.email;
    if (!email) {
      return res.status(200).send('OK');
    }
    const productName = (body.product_name || body.Product?.product_name || '').toLowerCase();
    let planId = 'monthly';
    let planDays = 30;
    if (productName.includes('vital') || productName.includes('vitalicio')) {
      planId = 'lifetime';
      planDays = 36500;
    } else if (productName.includes('anual')) {
      planId = 'annual';
      planDays = 365;
    }

    const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPA_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_SERVICE_KEY) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + planDays);
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          subscription_plan: planId,
          subscription_expires_at: expDate.toISOString(),
          subscription_status: 'active'
        })
      });
    }
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Erro kiwify-webhook:', err);
    return res.status(200).send('OK');
  }
});

// 8. API: Salvar Push Subscription
app.post('/api/save-subscription', async (req, res) => {
  try {
    const { userId, subscription } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'userId obrigatório' });
    }
    const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPA_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    if (SUPABASE_SERVICE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ push_subscription: subscription })
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Servir frontend compilado Vite (pasta dist/)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA Fallback para React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [A2 Mentor / VittaCash] Servidor ativo na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
