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
  },
  {
    id: 'equipment_rental',
    icon: <Camera size={28} />,
    title: 'Locação de Equipamento',
    category: 'Ativos',
    effort: 'Baixo',
    potential: 'R$ 50 - R$ 300 / diária',
    description: 'Transforme ferramentas, câmeras, barracas de camping ou bicicletas encostadas em dinheiro alugando-as.',
    steps: ['Liste seus equipamentos úteis.', 'Tire fotos e defina o valor da diária.', 'Divulgue no Aluga Logo/Grupos.', 'Assine um mini-contrato/caução.']
  },
  {
    id: 'shorts_editor',
    icon: <Smartphone size={28} />,
    title: 'Editor de Vídeos Curtos',
    category: 'Habilidades Digitais',
    effort: 'Médio',
    potential: 'R$ 1.000 - R$ 3.000 / mês',
    description: 'Edite vídeos estilo TikTok/Reels para profissionais liberais (médicos, corretores) usando apenas o celular ou CapCut.',
    steps: ['Aprenda dinâmica de legendas e cortes rápidos.', 'Pegue um vídeo e edite de graça como amostra.', 'Ofereça pacotes mensais de 15 vídeos.', 'Cobre por pacote e não por hora.']
  },
  {
    id: 'furniture_assembler',
    icon: <Hammer size={28} />,
    title: 'Montador Rápido',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 100 - R$ 300 / móvel',
    description: 'Pessoas compram online e não conseguem montar. Seja a salvação montando raques, mesas e armários.',
    steps: ['Compre uma parafusadeira básica.', 'Cadastre-se no GetNinjas/Triider.', 'Seja ágil e não arranhe as peças.', 'Peça para indicarem seu número no condomínio.']
  },
  {
    id: 'local_drop',
    icon: <ShoppingBag size={28} />,
    title: 'Arbitragem Local',
    category: 'Vendas',
    effort: 'Médio',
    potential: 'R$ 500 - R$ 2.000 / mês',
    description: 'Compre produtos demandados em atacadões ou feiras de atacado (Brás/25 de Março) e revenda em atacarejos locais ou condomínios.',
    steps: ['Identifique o "produto da moda".', 'Negocie lote direto no distribuidor.', 'Tire fotos apelativas.', 'Venda com pronta entrega nos grupos do bairro.']
  },
  {
    id: 'computer_repair',
    icon: <Laptop size={28} />,
    title: 'SOS Computadores',
    category: 'Manutenção Digital',
    effort: 'Alto',
    potential: 'R$ 80 - R$ 250 / serviço',
    description: 'Formatação, limpeza preventiva, troca de HD por SSD e instalação de pacotes Office/Antivírus.',
    steps: ['Tenha um Pendrive "Canivete Suíço".', 'Faça pacotes "Deixa seu PC como novo".', 'Sempre faça backup primeiro.', 'Ofereça visita domiciliar para ganhar na comodidade.']
  },
  {
    id: 'copywriter',
    icon: <Book size={28} />,
    title: 'Copywriter Local',
    category: 'Habilidades Digitais',
    effort: 'Alto',
    potential: 'R$ 300 - R$ 1.500 / projeto',
    description: 'Escreva textos persuasivos para anúncios, panfletos, e sites das empresas da sua cidade que publicam "textos chatos".',
    steps: ['Estude os 4 Ps e Gatilhos Mentais.', 'Encontre 3 comércios e reescreva um anúncio deles grátis.', 'Mostre como a versão nova atrai.', 'Feche pacotes de copywriting.']
  },
  {
    id: 'delivery_app',
    icon: <Car size={28} />,
    title: 'Entregador Estratégico',
    category: 'Gig Economy',
    effort: 'Alto',
    potential: 'R$ 150 / dia',
    description: 'Faça entregas (carro, moto ou bike) nos picos de demanda (Sexta noite / Sábado) diretamente por apps ou restaurantes parceiros.',
    steps: ['Ative contas em iFood, Rappi, Loggi.', 'Mapeie as rotas de restaurantes gourmet da sua cidade.', 'Foque EXCLUSIVAMENTE nas horas de tarifa dinâmica (pico).', 'Monitore seu custo de gasolina.']
  },
  {
    id: 'remote_closer',
    icon: <MessageSquare size={28} />,
    title: 'Fechador de Vendas no WhatsApp',
    category: 'Marketing',
    effort: 'Médio',
    potential: '10% de Comissão por Venda',
    description: 'Trabalhe no WhatsApp de produtores ou lojistas "quebrando objeções" e fechando vendas para clientes que abandonaram o carrinho.',
    steps: ['Gere networking em grupos digitais.', 'Mostre habilidade de negociação e escuta ativa.', 'Assuma os LEADS mornos do lojista.', 'Ganhe sobre o lucro que ninguém estava aproveitando.']
  },
  {
    id: 'moving_helper',
    icon: <HeartHandshake size={28} />,
    title: 'Empacotador de Mudanças',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 150 - R$ 400 / dia',
    description: 'Organizar uma mudança é o inferno de todos. Ofereça-se para empacotar itens com segurança, identificar caixas e limpar o local antes da saída.',
    steps: ['Tenha plástico bolha, etiquetas, fitas e papelão.', 'Seja meticuloso e rápido.', 'Faça parceria com empresas de frete.', 'Divulgue o "Stress-free moving".']
  },
  {
    id: 'tour_guide',
    icon: <Plane size={28} />,
    title: 'Guia de Experiências Locais',
    category: 'Entretenimento',
    effort: 'Médio',
    potential: 'R$ 80 - R$ 200 / tour',
    description: 'Sabe da história da sua cidade ou conhece os melhores cafés "secretos"? Crie uma experiência e venda para turistas corporativos ou AirBnb.',
    steps: ['Crie um roteiro memorável e autêntico.', 'Cadastre no Airbnb Experiences/TripAdvisor.', 'Tenha carisma e histórias prontas.', 'Faça fotos das turmas sorrindo para a página.']
  },
  {
    id: 'car_flipping',
    icon: <Car size={28} />,
    title: 'Flipping Automotivo',
    category: 'Vendas Avançado',
    effort: 'Alto',
    potential: 'R$ 2.000 - R$ 5.000 / carro',
    description: 'Compre o carro "feinho" mas de boa mecânica abaixo da FIPE, mande higienizar, faça micropintura, tire fotos "de lojista" e lucre na revenda.',
    steps: ['Aprenda mecânica básica de checagem ou feche parceria c/ mecânico.', 'Aperte donos enforcados no Facebook/OLX.', 'Invista R$ 500 no embelezamento.', 'Venda pelo preço de mercado exato.']
  },
  {
    id: 'bpo_financeiro',
    icon: <Wallet size={28} />,
    title: 'BPO Financeiro',
    category: 'Habilidades Digitais',
    effort: 'Médio',
    potential: 'R$ 500 - R$ 1.500 / empresa',
    description: 'Terceirize a emissão de notas e conciliação bancária (fazer o fechamento do caixa) para donos de consultório ou lojas que odeiam planilhas.',
    steps: ['Domine o Omie ou ContaAzul.', 'Aborde contadores locais pedindo indicação mútua.', 'Ofereça 1 semana de ordem no caos financeiro do cliente grátis.', 'Trabalhe poucas horas mensais por contrato.']
  },
  {
    id: 'elderly_companion',
    icon: <HeartHandshake size={28} />,
    title: 'Acompanhante Tecnológico Sênior',
    category: 'Serviços',
    effort: 'Baixo',
    potential: 'R$ 50 - R$ 100 / hora',
    description: 'Ajude idosos a instalarem bancos, pedirem Uber, fazer videochamadas com a família ou arrumar a configuração estranha que a TV ficou.',
    steps: ['Anuncie na igreja ou prédio local.', 'Tenha a paciência de um santo.', 'Mostre dicas de segurança contra fraudes a eles.', 'Crie uma relação de lealdade extrema.']
  },
  {
    id: 'pet_sitting_premium',
    icon: <Dog size={28} />,
    title: 'Hotel Pet Domiciliar',
    category: 'Serviços Reais',
    effort: 'Alto',
    potential: 'R$ 60 - R$ 150 / noite',
    description: 'Cansado e triste de deixar os cães em canis durante a viagem, os donos preferem pagar mais caro pro cachorro dormir confortavelmente "em uma casa". Hospede-os na sua sala.',
    steps: ['Peça vacinas em dia e focinho dócil.', 'Prepare a sala c/ telas nas janelas e sem riscos.', 'Grave Stories do cachorro feliz brincando na sua casa para o dono ver durante a viagem.', 'Gere reviews no DogHero ou Rover.']
  },
  {
    id: 'resume_writer',
    icon: <Book size={28} />,
    title: 'Reestruturação de Currículos',
    category: 'Conhecimento',
    effort: 'Baixo',
    potential: 'R$ 80 - R$ 250 / CV',
    description: 'A maioria dos excelentes profissionais tem currículos pavorosos que não passam nos robôs dos RHs. Reformate e aplique metodologias focadas em resultados (método STAR).',
    steps: ['Estude as práticas do LinkedIn e ATS atual.', 'Pegue o Word feio do cliente e transforme num PDF limpo/moderno.', 'Use ChatGPT inteligentemente apenas para polir.', 'Ofereça simulação de entrevista como UPSELL.']
  },
  {
    id: 'tv_mounting',
    icon: <HardHat size={28} />,
    title: 'Instalador de TVs e Suportes',
    category: 'Serviços Reais',
    effort: 'Baixo',
    potential: 'R$ 80 - R$ 150 / instalação',
    description: 'Furadeira na mão e fita métrica. Serviço que demanda 40 minutos mas as pessoas tem pavor de fazer errado e derrubar uma TV de R$4 mil no chão.',
    steps: ['Compre nível, brocas de qualidade e buchas de tijolo baiano.', 'Aviso o porteiro do condomínio que você domina a instalação com zero sujeira (leve aspirador).', 'Tire foto dela alinhadinha na parede.', 'Faça pacotes conjugados (TV + Cortina).']
  },
  {
    id: 'personal_shopper',
    icon: <ShoppingBag size={28} />,
    title: 'Personal Shopper/Importador',
    category: 'Vendas',
    effort: 'Baixo',
    potential: '15% - 30% a mais na taxa',
    description: 'Compre roupas infantis da Carter`s, iPhones ou maquiagens de sites gringos (usando redirecionadores) ou viagens rápidas ao Outlet. Traga encomendado de forma segura.',
    steps: ['Ache fornecedores "Grab and Go" de redirecionamento Miami.', 'Pegue a verba do cliente adiantada via sinal.', 'Emita os despachos.', 'A galera adora a aura de exclusividade do importado e detesta a burocracia de comprar sozinho.']
  },
  {
    id: 'subtitles',
    icon: <Languages size={28} />,
    title: 'Legendador Meticuloso',
    category: 'Habilidades Digitais',
    effort: 'Alto',
    potential: 'R$ 200 - R$ 600 / vídeo',
    description: 'Traduzir e legendar com "timing perfeito" (.SRT) o material de influenciadores brasileiros que querem viralizar seus vídeos no mundo inteiro (Inglês ou Espanhol).',
    steps: ['Busque Youtubers grandes em ascensão.', 'Traga o conhecimento da fluência + slang correta (gírias do nativo).', 'Entregue o arquivo e ajude no título e capa gringos.', 'Construa um case internacional rápido.']
  },
  {
    id: 'video_thumbnail_designer',
    icon: <Paintbrush size={28} />,
    title: 'Designer de Capas (Thumbnails)',
    category: 'Habilidades Digitais',
    effort: 'Baixo',
    potential: 'R$ 30 - R$ 100 / capa',
    description: 'Uma capa bem feita aumenta o faturamento do YouTuber em milhares de reais. Seja o designer que traz a psicologia visual (leitura da esquerda, contrastes, caras de suspense) em thumbnails matadoras.',
    steps: ['Estude a teoria de cores do Mr Beast e Peter (Ei Nerd).', 'Construa um banco de efeitos (Raios, Outlines vermelhos).', 'Faça 3 capas famosas melhoradas e mande no direct como provocação para os canais que tem views ruins.', 'Venda combos e suba no barco de influenciadores bons.']
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
          40 estratégias reais para transformar seu tempo livre em liberdade financeira
        </p>
      </div>

      {/* 🚀 MENSAGEM INSPIRADORA (TOPO) */}
      <div className="shrink-0 p-5 bg-gradient-to-r from-yellow-900/30 to-indigo-900/30 rounded-[2rem] flex items-center gap-5">
          <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-300 shrink-0">
              <Star size={22} />
          </div>
          <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-white mb-1">O Próximo Passo Só Depende de Você</h4>
              <p className="text-[10px] font-medium text-yellow-200/70 leading-relaxed">
                Escolha UMA dessas 40 oportunidades hoje e execute o primeiro passo. A diferença entre quem enriquece e quem sonha é a velocidade da execução.
              </p>
          </div>
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
                className={`group relative bg-white/5 backdrop-blur-md rounded-[1.5rem] p-4 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-center shadow-lg
                  ${isSelected ? 'md:col-span-2 xl:col-span-2 row-span-2 bg-white/10 p-6 rounded-[2.5rem]' : 'hover:bg-white/10'}`}
              >
                {/* Cabeçalho do Card */}
                <div className={`flex ${isSelected ? 'flex-col items-start' : 'items-center gap-3'} justify-between relative z-10 w-full`}>
                  <div className={`flex ${isSelected ? 'flex-col items-start' : 'items-center gap-3'} w-full`}>
                    <div className={`p-2.5 rounded-2xl bg-black/30 shrink-0 ${isSelected ? 'text-yellow-400 mb-4' : 'text-slate-400 group-hover:text-white'}`}>
                      {op.icon}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                       {isSelected ? (
                         <>
                           <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 rounded-full text-indigo-300 mb-2 inline-block">
                             {op.category}
                           </span>
                           <h3 className="text-base font-black uppercase tracking-tight text-white mb-2 leading-tight">{op.title}</h3>
                         </>
                       ) : (
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-white leading-tight truncate">{op.title}</h3>
                       )}
                    </div>
                  </div>

                  {isSelected ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
                      className="absolute right-0 top-0 p-1.5 rounded-full bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 transition-all shrink-0"
                    >
                      <X size={18} />
                    </button>
                  ) : (
                    <div className="p-1.5 rounded-full text-slate-500 group-hover:text-white transition-colors shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>

                {/* Info Principal */}
                {isSelected && (
                  <div className="relative z-10">
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
                    
                    <p className="text-sm text-slate-300 leading-relaxed font-medium transition-all duration-500 mb-6">
                      {op.description}
                    </p>
                  </div>
                )}

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

      </div>
    </div>
  );
}