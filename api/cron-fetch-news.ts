// api/cron-fetch-news.ts — Vercel Serverless Function / Cron Job
// Redator Automático A2 Mentor: busca notícias de todas as categorias, gera conteúdo com IA e publica no portal.

export const config = {
  runtime: 'nodejs',
};

// ─── Fontes RSS por categoria ─────────────────────────────────────────────────
const CATEGORY_SOURCES = [
  {
    category: 'Mercado Financeiro',
    sources: [
      'https://g1.globo.com/rss/g1/economia/',
      'https://feeds.feedburner.com/infomoney/hUmS', // InfoMoney
    ],
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop',
    ],
    aiContext: 'mercado financeiro, bolsa de valores, ações, investimentos, economia brasileira',
    source_name: 'G1 Economia / InfoMoney',
  },
  {
    category: 'Empreendedorismo',
    sources: [
      'https://revistapegn.globo.com/rss',
      'https://g1.globo.com/rss/g1/economia/negocios/',
      'https://agenciasebrae.com.br/feed/',
      'https://blog.rdstation.com/feed/',
      'https://www.alomorfia.com.br/feed/',
    ],
    images: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop',
    ],
    aiContext: 'empreendedorismo, marketing digital, vendas, negócios, startups, gestão empresarial, pequenas e médias empresas',
    source_name: 'Pequenas Empresas & Grandes Negócios',
  },
  {
    category: 'Criptomoedas',
    sources: [
      'https://portaldobitcoin.uol.com.br/feed/',
      'https://br.cointelegraph.com/rss',
    ],
    images: [
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=600&auto=format&fit=crop',
    ],
    aiContext: 'criptomoedas, Bitcoin, Ethereum, blockchain, DeFi, Web3, ativos digitais',
    source_name: 'Portal do Bitcoin / CoinTelegraph Brasil',
  },
  {
    category: 'Tecnologia',
    sources: [
      'https://canaltech.com.br/rss/',
      'https://www.techtudo.com.br/rss/geral/feed.xml',
    ],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    ],
    aiContext: 'tecnologia, inteligência artificial, inovação, fintech, aplicativos financeiros, segurança digital',
    source_name: 'Canaltech / TechTudo',
  },
];

// ─── Temas para artigos VittaConsultoria (gerados 100% por IA) ────────────────
const VITTA_CONSULTORIA_TOPICS = [
  'Como sair das dívidas em 2025: um guia prático passo a passo',
  'Regra 50-30-20: o método mais simples para organizar suas finanças',
  'O que é reserva de emergência e como montar a sua do zero',
  'Tesouro Direto vs. CDB: qual rende mais para o investidor iniciante?',
  'Como a inflação corrói seu dinheiro e o que fazer para se proteger',
  'Independência financeira: o que é e como calcular o seu número',
  'FIIs: o guia completo para ganhar renda passiva com Fundos Imobiliários',
  '5 erros financeiros que impedem você de enriquecer',
  'Como negociar dívidas e limpar o nome rapidamente',
  'Dividendos: como viver de renda passiva na bolsa de valores',
];

// ─── Imagens para VittaConsultoria ───────────────────────────────────────────
const VITTA_IMAGES = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop',
];

// ─── Parser de RSS ─────────────────────────────────────────────────────────────
function parseRSS(xmlText: string): { title: string; description: string; link: string }[] {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i;
  const titleRegexBackup = /<title>([\s\S]*?)<\/title>/i;
  const descriptionRegex = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i;
  const descriptionRegexBackup = /<description>([\s\S]*?)<\/description>/i;
  const linkRegexAlt = /<link>(https?:\/\/[^<]+)<\/link>/i;
  const linkRegexFull = /<link>([\s\S]*?)<\/link>/i;

  const items: { title: string; description: string; link: string }[] = [];
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    let title = '';
    const titleMatch = itemContent.match(titleRegex) || itemContent.match(titleRegexBackup);
    if (titleMatch) title = titleMatch[1].trim().replace(/<[^>]*>/g, '');

    let description = '';
    const descMatch = itemContent.match(descriptionRegex) || itemContent.match(descriptionRegexBackup);
    if (descMatch) description = descMatch[1].trim().replace(/<[^>]*>/g, '');

    let link = '';
    const linkMatch = itemContent.match(linkRegexAlt) || itemContent.match(linkRegexFull);
    if (linkMatch) link = linkMatch[1].trim();

    if (title && link) {
      items.push({ title, description: description.substring(0, 500), link });
    }
  }

  return items;
}

// ─── Gerador de conteúdo via Gemini ──────────────────────────────────────────
async function generateWithGemini(
  apiKey: string,
  prompt: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

// ─── Verificação de duplicidade ───────────────────────────────────────────────
async function newsExists(supabaseUrl: string, serviceKey: string, link: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_content?content_type=eq.news&meta_value->>external_url=eq.${encodeURIComponent(link)}`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

// ─── Inserção no Supabase ─────────────────────────────────────────────────────
async function insertNews(
  supabaseUrl: string,
  serviceKey: string,
  title: string,
  description: string,
  imageUrl: string,
  category: string,
  externalUrl: string
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/site_content`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([{
        content_type: 'news',
        title,
        description,
        image_url: imageUrl,
        is_active: true,
        meta_value: { category, external_url: externalUrl },
      }]),
    });
    return res.ok || res.status === 201;
  } catch {
    return false;
  }
}

// ─── Handler Principal ────────────────────────────────────────────────────────
export default async function handler(req: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return new Response('Missing Supabase environment variables', { status: 500 });
  }

  const report: Record<string, { success: number; skipped: number }> = {};

  // ─── 1. Processa categorias com RSS ─────────────────────────────────────────
  for (const source of CATEGORY_SOURCES) {
    report[source.category] = { success: 0, skipped: 0 };

    for (const rssUrl of source.sources) {
      try {
        const rssRes = await fetch(rssUrl, { signal: AbortSignal.timeout(8000) });
        if (!rssRes.ok) continue;

        const xmlText = await rssRes.text();
        const items = parseRSS(xmlText).slice(0, 2); // 2 notícias por fonte

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // Verifica duplicidade
          const exists = await newsExists(SUPABASE_URL, SUPABASE_SERVICE_KEY, item.link);
          if (exists) {
            report[source.category].skipped++;
            continue;
          }

          // Gera conteúdo com IA
          let finalContent = item.description || item.title;
          if (GEMINI_API_KEY) {
            const prompt = `Você é o redator especializado da A2 Mentor, portal de inteligência financeira.
Escreva um artigo jornalístico completo em português sobre a notícia abaixo com tom profissional, educativo e acessível.

Estrutura obrigatória:
1. Resumo da notícia (2-3 parágrafos diretos e informativos)
2. **A2 Insights:** (dicas práticas de ${source.aiContext} para o leitor brasileiro)

Regras:
- Tom informativo mas próximo ao leitor
- Sem repetir o título no corpo do texto
- Sem incluir links ou URLs
- Máximo 400 palavras no total

Título: "${item.title}"
Contexto: "${item.description}"`;

            const generated = await generateWithGemini(GEMINI_API_KEY, prompt);
            if (generated) finalContent = generated;
          }

          let resolvedSource = source.source_name;
          if (item.link.includes('sebrae.com.br') || rssUrl.includes('sebrae')) {
            resolvedSource = 'Agência Sebrae de Notícias';
          } else if (item.link.includes('rdstation.com') || rssUrl.includes('rdstation')) {
            resolvedSource = 'RD Station';
          } else if (item.link.includes('alomorfia.com.br') || rssUrl.includes('alomorfia')) {
            resolvedSource = 'Revista Alomorfia';
          } else if (item.link.includes('pegn') || item.link.includes('revistapegn') || rssUrl.includes('pegn')) {
            resolvedSource = 'Pequenas Empresas & Grandes Negócios';
          } else if (item.link.includes('g1.globo.com') || rssUrl.includes('g1.globo')) {
            resolvedSource = 'G1 Economia';
          }

          if (!finalContent.includes('reportagem de') && !finalContent.includes('baseadas em')) {
            finalContent += `\n\nInformações originais baseadas em: ${resolvedSource}.`;
          }

          const imageUrl = source.images[i % source.images.length];
          const ok = await insertNews(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            item.title,
            finalContent,
            imageUrl,
            source.category,
            item.link
          );

          if (ok) report[source.category].success++;
          else report[source.category].skipped++;
        }
      } catch (err) {
        console.error(`Erro ao processar feed ${rssUrl}:`, err);
      }
    }
  }

  // ─── 2. Gera artigo VittaConsultoria (100% IA, sem RSS) ─────────────────────
  report['VittaConsultoria'] = { success: 0, skipped: 0 };

  if (GEMINI_API_KEY) {
    try {
      // Escolhe um tema baseado no dia da semana para variar
      const dayIndex = new Date().getDay(); // 0-6
      const topicIndex = (new Date().getDate() + dayIndex) % VITTA_CONSULTORIA_TOPICS.length;
      const topic = VITTA_CONSULTORIA_TOPICS[topicIndex];

      // Usa a data atual como identificador único para evitar duplicidade diária
      const todayId = `vitta-consultoria-${new Date().toISOString().split('T')[0]}`;
      const exists = await newsExists(SUPABASE_URL, SUPABASE_SERVICE_KEY, todayId);

      if (!exists) {
        const prompt = `Você é o consultor financeiro sênior da A2 Mentor.
Escreva um artigo completo, educativo e de alta qualidade em português sobre:
"${topic}"

Estrutura obrigatória:
1. Introdução envolvente (1 parágrafo)
2. Desenvolvimento com 3 tópicos práticos (use **Tópico:** para destacar)
3. **A2 Insights:** dica exclusiva da consultoria A2 para o leitor colocar em prática hoje
4. Conclusão motivadora (1 parágrafo)

Regras:
- Tom de especialista, mas acessível e humano
- Foco em finanças pessoais brasileiras (Real, Tesouro Direto, Nubank, etc.)
- Sem incluir links ou URLs
- Aproximadamente 450 palavras`;

        const content = await generateWithGemini(GEMINI_API_KEY, prompt);

        if (content) {
          const imageUrl = VITTA_IMAGES[dayIndex % VITTA_IMAGES.length];
          const ok = await insertNews(
            SUPABASE_URL,
            SUPABASE_SERVICE_KEY,
            topic,
            content + '\n\nConteúdo exclusivo produzido pela equipe A2 Mentor.',
            imageUrl,
            'VittaConsultoria',
            todayId
          );
          if (ok) report['VittaConsultoria'].success++;
        }
      } else {
        report['VittaConsultoria'].skipped++;
      }
    } catch (err) {
      console.error('Erro ao gerar conteúdo VittaConsultoria:', err);
    }
  }

  return new Response(
    JSON.stringify({
      message: '✅ Redator A2 Mentor finalizado com sucesso!',
      data: new Date().toISOString(),
      categorias: report,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
