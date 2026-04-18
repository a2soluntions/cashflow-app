import React, { useState } from 'react';
import { 
  Zap, Smartphone, Laptop, ShoppingBag, Hammer, 
  Car, Camera, Book, Share2, Wallet, Timer, 
  ArrowUpRight, Star, CheckCircle2, X, ChevronRight,
  Music, Paintbrush, Utensils, Languages, MessageSquare,
  Gift, HardHat, Plane, Dog, HeartHandshake, Mic, Search // Adicionei o Search aqui no final
} from 'lucide-react';

interface IncomeOpportunity {
  id: string;
  icon: React.ReactNode;
  title: string;
  category: string;
  effort: 'Baixo' | 'Médio' | 'Alto';
  potential: string;
  description: string;
  steps: string[];
}

const opportunities: IncomeOpportunity[] = [
  {
    id: 'resell',
    icon: <ShoppingBag size={28} />,
    title: 'Desapego Lucrativo',
    category: 'Venda de Ativos',
    effort: 'Baixo',
    potential: 'R$ 200 - R$ 2.000+',
    description: 'Transforme itens parados (eletrônicos, roupas, móveis) em caixa rápido através de marketplaces.',
    steps: ['Liste 5 itens parados.', 'Tire fotos excelentes.', 'Anuncie no OLX/Enjoei.', 'Responda rápido.']
  },
  {
    id: 'freelance_digital',
    icon: <Laptop size={28} />,
    title: 'Micro-Freelancing',
    category: 'Habilidades Digitais',
    effort: 'Médio',
    potential: 'R$ 50 - R$ 500 / tarefa',
    description: 'Tradução, digitação ou design simples para empresas globais via plataformas digitais.',
    steps: ['Crie perfil no Fiverr/Workana.', 'Foque em uma habilidade.', 'Entregue rápido.', 'Peça avaliações.']
  },
  {
    id: 'ugc_creator',
    icon: <Smartphone size={28} />,
    title: 'UGC (Conteúdo de Marca)',
    category: 'Marketing',
    effort: 'Médio',
    potential: 'R$ 150 - R$ 1.000 / vídeo',
    description: 'Grave reviews de produtos para marcas usarem em anúncios, sem precisar de seguidores.',
    steps: ['Grave 3 vídeos teste.', 'Monte portfólio no Canva.', 'Aborde marcas no Instagram.', 'Defina seu preço por vídeo.']
  },
  {
    id: 'dog_walker',
    icon: <Dog size={28} />,
    title: 'Pet Sitter / Dog Walker',
    category: 'Serviços Reais',
    effort: 'Médio',
    potential: 'R$ 300 - R$ 1.500 / mês',
    description: 'Cuide ou passeie com animais de estimação de vizinhos que trabalham fora.',
    steps: ['Cadastre-se na DogHero.', 'Divulgue no prédio/bairro.', 'Tenha kit básico (guias).', 'Mande fotos para os donos.']
  },
  {
    id: 'infoproduct',
    icon: <Book size={28} />,
    title: 'Infoprodutos (E-books)',
    category: 'Conhecimento',
    effort: 'Alto',
    potential: 'Escalável (R$ 500+)',
    description: 'Sistematize o que você sabe (receitas, planilhas, tutoriais) em um PDF de alto valor.',
    steps: ['Defina um problema real.', 'Escreva a solução no Word.', 'Formate no Canva.', 'Venda na Hotmart/Kiwi.']
  },
  {
    id: 'airbnb_host',
    icon: <Plane size={28} />,
    title: 'Co-Host de Airbnb',
    category: 'Imobiliário',
    effort: 'Médio',
    potential: '10% a 20% da reserva',
    description: 'Gerencie o anúncio e a limpeza de imóveis de terceiros que não têm tempo para o app.',
    steps: ['Procure donos de imóveis.', 'Crie o anúncio otimizado.', 'Coordene check-ins.', 'Gerencie a limpeza.']
  },
  {
    id: 'handyman',
    icon: <Hammer size={28} />,
    title: 'Marido/Esposa de Aluguel',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 100 - R$ 400 / visita',
    description: 'Pequenos reparos: trocar lâmpadas, instalar prateleiras ou consertar torneiras.',
    steps: ['Tenha ferramentas básicas.', 'Divulgue em grupos de bairro.', 'Seja pontual e limpo.', 'Peça recomendações.']
  },
  {
    id: 'affiliate_amazon',
    icon: <Share2 size={28} />,
    title: 'Afiliado Amazon',
    category: 'Vendas Online',
    effort: 'Baixo',
    potential: '9% de comissão',
    description: 'Indique produtos úteis em grupos de WhatsApp ou redes sociais através de links únicos.',
    steps: ['Crie conta de Associado.', 'Escolha itens em oferta.', 'Compartilhe com contexto.', 'Acompanhe as vendas.']
  },
  {
    id: 'voice_over',
    icon: <Mic size={28} />,
    title: 'Locução e Voice-over',
    category: 'Habilidades Digitais',
    effort: 'Médio',
    potential: 'R$ 80 - R$ 300 / áudio',
    description: 'Use sua voz para narrar vídeos de YouTube (canais dark) ou treinamentos empresariais.',
    steps: ['Tenha um mic decente.', 'Grave amostras de voz.', 'Anuncie no Vintepila.', 'Estude técnicas de dicção.']
  },
  {
    id: 'social_media_local',
    icon: <MessageSquare size={28} />,
    title: 'Gestão de Redes Locais',
    category: 'Marketing',
    effort: 'Alto',
    potential: 'R$ 500 - R$ 1.500 / cliente',
    description: 'Ajude comércios do bairro (padarias, salões) a postarem conteúdos melhores no Instagram.',
    steps: ['Tire fotos dos produtos.', 'Crie posts no Canva.', 'Responda comentários.', 'Mostre o aumento de visitas.']
  },
  {
    id: 'clean_cooking',
    icon: <Utensils size={28} />,
    title: 'Marmitas Saudáveis',
    category: 'Gastronomia',
    effort: 'Alto',
    potential: 'R$ 400 - R$ 2.500 / mês',
    description: 'Prepare e venda kits de refeições congeladas para pessoas que querem dieta, mas não têm tempo.',
    steps: ['Defina um cardápio enxuto.', 'Compre potes padrão.', 'Divulgue no trabalho/academia.', 'Entregue semanalmente.']
  },
  {
    id: 'translation',
    icon: <Languages size={28} />,
    title: 'Tradução Técnica',
    category: 'Conhecimento',
    effort: 'Médio',
    potential: 'R$ 0,15 - R$ 0,40 / palavra',
    description: 'Traduza manuais, artigos ou sites de empresas que querem expandir para o Brasil.',
    steps: ['Domine um segundo idioma.', 'Use ferramentas de auxílio.', 'Foque em um nicho (ex: TI).', 'Contate agências de tradução.']
  },
  {
    id: 'personalized_gifts',
    icon: <Gift size={28} />,
    title: 'Cestas Personalizadas',
    category: 'Vendas',
    effort: 'Médio',
    potential: '30% a 50% de lucro',
    description: 'Monte cestas de café da manhã ou presentes temáticos para datas comemorativas.',
    steps: ['Busque fornecedores atacado.', 'Crie embalagens premium.', 'Foque em datas (Ex: Dia das Mães).', 'Divulgue via status/stories.']
  },
  {
    id: 'cleaning_organization',
    icon: <HeartHandshake size={28} />,
    title: 'Personal Organizer',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 300 - R$ 1.000 / projeto',
    description: 'Organize armários e despensas de forma lógica e estética para famílias ocupadas.',
    steps: ['Estude métodos de dobra.', 'Compre cestos organizadores.', 'Faça o "antes e depois".', 'Cobre por cômodo ou hora.']
  },
  {
    id: 'virtual_assistant',
    icon: <Star size={28} />,
    title: 'Assistente Virtual',
    category: 'Habilidades Digitais',
    effort: 'Alto',
    potential: 'R$ 800 - R$ 3.000 / mês',
    description: 'Organize a agenda, e-mails e pagamentos de pequenos empresários ou médicos.',
    steps: ['Seja organizado e discreto.', 'Domine Google Calendar/Excel.', 'Ofereça 5h semanais de teste.', 'Automatize tarefas repetitivas.']
  },
  {
    id: 'car_detailing',
    icon: <Car size={28} />,
    title: 'Estética Automotiva Móvel',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 150 - R$ 500 / carro',
    description: 'Faça higienização interna e lavagem a seco de carros na garagem do cliente.',
    steps: ['Compre produtos específicos.', 'Tenha um aspirador portátil.', 'Ofereça em condomínios.', 'Foque no brilho e aroma.']
  },
  {
    id: 'tshirt_design',
    icon: <Paintbrush size={28} />,
    title: 'Print on Demand',
    category: 'Vendas Online',
    effort: 'Baixo',
    potential: 'R$ 10 - R$ 40 / venda',
    description: 'Crie estampas criativas. Uma empresa fabrica e entrega quando houver venda (Ex: Reserva Ink).',
    steps: ['Crie designs no Canva.', 'Suba na plataforma (Ink).', 'Divulgue para o nicho (Ex: Gamers).', 'Não precisa de estoque.']
  },
  {
    id: 'reforma_moveis',
    icon: <HardHat size={28} />,
    title: 'Restauração de Móveis',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: '200% de valorização',
    description: 'Pegue móveis de madeira velhos/desgastados, lixe, pinte e revenda como "Vintage/Retrô".',
    steps: ['Garimpe móveis baratos.', 'Estude pintura em spray/giz.', 'Troque puxadores por novos.', 'Anuncie com fotos "vibe".']
  },
  {
    id: 'mystery_shopper',
    icon: <Search size={28} />,
    title: 'Cliente Mistério',
    category: 'Serviços',
    effort: 'Baixo',
    potential: 'R$ 50 - R$ 150 + Reembolso',
    description: 'Visite lojas/restaurantes anonimamente para avaliar o atendimento e ganhe por isso.',
    steps: ['Cadastre-se na Market Force.', 'Siga o roteiro de inspeção.', 'Tire fotos discretas.', 'Escreva relatório detalhado.']
  },
  {
    id: 'music_lessons',
    icon: <Music size={28} />,
    title: 'Aulas de Música/Arte',
    category: 'Conhecimento',
    effort: 'Médio',
    potential: 'R$ 60 - R$ 120 / hora',
    description: 'Ensine violão, teclado, pintura ou desenho para crianças e adultos online ou presencial.',
    steps: ['Defina sua metodologia.', 'Ofereça a 1ª aula grátis.', 'Venda pacotes de 4 aulas.', 'Grave o progresso do aluno.']
  }
];

export function ExtraIncomeModule() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="h-full w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="px-2 shrink-0">
        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <Zap className="text-yellow-400 fill-yellow-400/20" /> Acelerador de Renda
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          20 estratégias reais para transformar seu tempo livre em liberdade financeira
        </p>
      </div>

      {/* GRID COM SCROLL INVISÍVEL */}
      <div className="flex-1 overflow-y-auto pb-6 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {opportunities.map((op) => {
            const isSelected = selectedId === op.id;

            return (
              <div 
                key={op.id}
                onClick={() => !isSelected && setSelectedId(op.id)}
                className={`group relative bg-white/5 backdrop-blur-md border rounded-[2.5rem] p-6 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between
                  ${isSelected ? 'border-yellow-500/50 shadow-yellow-500/10 md:col-span-2 xl:col-span-2 row-span-2' : 'border-white/10 hover:border-white/20 hover:bg-white/10 min-h-[250px]'}`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                  <div className={`p-3 rounded-2xl bg-black/30 border border-white/10 ${isSelected ? 'text-yellow-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {op.icon}
                  </div>
                  {isSelected && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                      className="p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Info Principal */}
                <div className="relative z-10">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-indigo-300 mb-2 inline-block">
                    {op.category}
                  </span>
                  <h3 className="text-base font-black uppercase tracking-tight text-white mb-2 leading-tight">{op.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <Timer size={12} className="text-slate-500" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Esforço: {op.effort}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wallet size={12} className="text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">{op.potential}</span>
                    </div>
                  </div>
                  
                  <p className={`text-xs text-slate-300 leading-relaxed font-medium transition-all duration-500 ${isSelected ? 'mb-6 text-sm' : 'line-clamp-2'}`}>
                    {op.description}
                  </p>
                </div>

                {/* CONTEÚDO EXPANDIDO */}
                {isSelected && (
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500 mt-4 border-t border-white/5 pt-6">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                        <ArrowUpRight size={14} /> Passo a Passo Inicial
                      </h4>
                      {op.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                          <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-yellow-500">{idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 p-6 flex flex-col justify-center items-center text-center">
                        <CheckCircle2 size={32} className="text-emerald-400 mb-3" />
                        <h5 className="text-[10px] font-black uppercase text-emerald-400 mb-2 tracking-widest">Mindset VittaCash</h5>
                        <p className="text-[11px] text-slate-300 italic leading-relaxed">"Renda extra não é apenas dinheiro a mais; é o capital que vai comprar sua liberdade. Reinvista 100% disso no seu futuro."</p>
                    </div>
                  </div>
                )}

                {/* Brilho no Card */}
                <div className={`absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            );
          })}

        </div>

        {/* MENSAGEM FINAL */}
        <div className="mt-8 p-10 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/40 border border-indigo-500/20 rounded-[3rem] text-center relative overflow-hidden">
            <Star className="absolute top-5 left-5 text-indigo-500/20" size={120} />
            <h4 className="text-xl font-black uppercase tracking-tighter text-white mb-3 relative z-10">O próximo passo só depende de você</h4>
            <p className="text-sm font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed relative z-10">
              Escolha **UMA** dessas 20 oportunidades hoje e execute o primeiro passo. A diferença entre quem enriquece e quem apenas sonha é a velocidade da execução. Use o VittaCash para monitorar esse novo lucro e veja sua liberdade chegar meses ou anos mais cedo.
            </p>
        </div>
      </div>
    </div>
  );
}