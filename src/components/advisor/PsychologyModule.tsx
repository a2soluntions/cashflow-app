import React, { useState } from 'react';
import { 
  Brain, Tag, Users, Anchor, BatteryWarning, 
  TrendingUp, ShieldAlert, Unlock, Sparkles, ChevronRight, X,
  RefreshCcw, CreditCard, Flame, EyeOff, Crosshair, 
  Rocket, Sun, HandHeart, Award, Star, Coins, Search, Repeat, Compass
} from 'lucide-react';

interface Trap {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  bgGlow: string;
  mindTrick: string;
  solution: string;
}

const traps: Trap[] = [
  {
    id: 'discount',
    icon: <Tag size={28} />,
    title: 'Ilusão de Desconto',
    subtitle: 'Foco na "economia" falsa',
    color: 'text-amber-400',
    bgGlow: 'bg-amber-500/10',
    mindTrick: 'Seu cérebro foca no tamanho do desconto (ex: "Economizei R$ 300!") em vez de focar no dinheiro que está saindo. Você acaba comprando o que não precisa só porque estava barato.',
    solution: 'Pergunte-se: "Eu compraria este item hoje pelo preço normal?". Se a resposta for não, você não está economizando, está gastando.'
  },
  {
    id: 'herd',
    icon: <Users size={28} />,
    title: 'Efeito Manada',
    subtitle: 'A pressão invisível',
    color: 'text-blue-400',
    bgGlow: 'bg-blue-500/10',
    mindTrick: 'Você gasta para acompanhar o padrão de vida de amigos, vizinhos ou influenciadores, mesmo que a sua realidade financeira seja completamente diferente da deles.',
    solution: 'Desvincule sucesso de aparência. A maioria das pessoas que aparentam riqueza na internet estão afundadas em dívidas. Viva o seu próprio jogo.'
  },
  {
    id: 'lifestyle',
    icon: <TrendingUp size={28} />,
    title: 'Inflação do Estilo de Vida',
    subtitle: 'O ralo do aumento salarial',
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10',
    mindTrick: 'Sempre que você ganha um aumento, você automaticamente melhora seu carro, muda de casa ou gasta mais. O dinheiro "a mais" some instantaneamente.',
    solution: 'Ao receber um aumento, aplique a regra dos 50/50: use metade para curtir a vida hoje e mande a outra metade direto para investimentos futuros.'
  },
  {
    id: 'sunk_cost',
    icon: <Anchor size={28} />,
    title: 'Custo Irrecuperável',
    subtitle: 'A âncora do erro passado',
    color: 'text-rose-400',
    bgGlow: 'bg-rose-500/10',
    mindTrick: 'Você continua investindo dinheiro em algo ruim (um carro que só quebra, uma assinatura que não usa) só porque "já gastou muito com isso até agora".',
    solution: 'O dinheiro que foi, não volta. Tome decisões focadas no amanhã: "Vale a pena colocar mais 1 real nisso a partir de hoje?". Se não, corte a perda na hora.'
  },
  {
    id: 'mental_accounting',
    icon: <Brain size={28} />,
    title: 'Contabilidade Mental',
    subtitle: 'Dinheiro "fácil" vai fácil',
    color: 'text-purple-400',
    bgGlow: 'bg-purple-500/10',
    mindTrick: 'Você trata "dinheiro extra" (13º, bônus, presente) como algo que pode ser torrado irresponsavelmente, diferente do seu salário suado do mês.',
    solution: 'O dinheiro não tem etiqueta. Todo real vale 1 real, não importa a origem. Trate qualquer entrada inesperada com o mesmo respeito que você trata seu salário.'
  },
  {
    id: 'decision_fatigue',
    icon: <BatteryWarning size={28} />,
    title: 'Fadiga de Decisão',
    subtitle: 'Compras por exaustão',
    color: 'text-orange-400',
    bgGlow: 'bg-orange-500/10',
    mindTrick: 'No final do dia, após tomar dezenas de decisões, sua "bateria mental" acaba. É aí que você pede delivery caro ou faz compras por impulso no celular.',
    solution: 'Proíba-se de tomar decisões financeiras à noite. Deixe no carrinho virtual e durma. Só finalize a compra na manhã seguinte, de mente limpa.'
  },
  {
    id: 'diderot',
    icon: <RefreshCcw size={28} />,
    title: 'O Ciclo de Diderot',
    subtitle: 'A compra que puxa outras',
    color: 'text-pink-400',
    bgGlow: 'bg-pink-500/10',
    mindTrick: 'Você compra algo novo (ex: uma TV nova) e as outras coisas parecem velhas. Isso desencadeia uma espiral de compras (rack, sofá) para "combinar" com a TV.',
    solution: 'A perfeição estética custa caro. Estabeleça um limite: se comprar um item de alto valor, faça um pacto de não comprar mais nada para aquele ambiente por 3 meses.'
  },
  {
    id: 'cashless',
    icon: <CreditCard size={28} />,
    title: 'A Anestesia do Pagamento',
    subtitle: 'O efeito fricção zero',
    color: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10',
    mindTrick: 'Pagar com aproximação, Pix ou clique-único não dói no cérebro. Como você não vê a nota física indo embora, o subconsciente acha que não gastou nada.',
    solution: 'Ative notificações a cada compra. Para estancar impulsos crônicos, force-se a pagar saídas de lazer apenas no Pix manual para "sentir" o dinheiro saindo.'
  },
  {
    id: 'fomo',
    icon: <Flame size={28} />,
    title: 'O Gatilho F.O.M.O.',
    subtitle: 'Medo de ficar de fora',
    color: 'text-red-500',
    bgGlow: 'bg-red-500/10',
    mindTrick: 'Ver pessoas lucrando com uma criptomoeda nova ou comprando ingressos gera pânico. Você compra no pico da emoção pelo medo desesperado de perder a chance.',
    solution: 'Aceite que você vai perder 99% das "oportunidades únicas". Se algo virou moda e todos estão falando, o preço já está inflado. Aja com lógica, não por urgência.'
  },
  {
    id: 'ostrich',
    icon: <EyeOff size={28} />,
    title: 'O Efeito Avestruz',
    subtitle: 'Cegueira voluntária',
    color: 'text-slate-400',
    bgGlow: 'bg-slate-500/10',
    mindTrick: 'Quando as finanças apertam, você evita abrir o app do banco ou ver as faturas. O cérebro cria a ilusão de que ignorar o problema o faz desaparecer.',
    solution: 'Encare o monstro. O estresse de fugir é pior que o número real. Marque na agenda o "Dia da Verdade": 15 minutos toda sexta para encarar extratos e faturas.'
  },
  {
    id: 'anchoring',
    icon: <Crosshair size={28} />,
    title: 'Ancoragem de Preços',
    subtitle: 'O truque do "De/Por"',
    color: 'text-teal-400',
    bgGlow: 'bg-teal-500/10',
    mindTrick: 'A loja mostra um produto por R$ 1.000 riscado por R$ 500. Seu cérebro "ancora" nos mil e acha que 500 é de graça, mesmo que o item só valha 300.',
    solution: 'Ignore totalmente o preço riscado. Avalie o item apenas pelo valor que ele traz para sua vida e use sites de histórico de preços para descobrir a verdade.'
  },
  {
    id: 'instant_gratification',
    icon: <Rocket size={28} />,
    title: 'Gratificação Instantânea',
    subtitle: 'Assaltando o seu futuro',
    color: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/10',
    mindTrick: 'A mente quer o prazer de comprar AGORA e ignora a dor da fatura de amanhã. Nosso cérebro não consegue ter empatia pelo nosso "eu do futuro".',
    solution: 'Use a Regra das 48 Horas. Colocou no carrinho? Feche o app e espere dois dias. Se a vontade de comprar continuar forte, avalie; senão, era só impulso químico.'
  },
  {
    id: 'optimism_bias',
    icon: <Sun size={28} />,
    title: 'Otimismo Tóxico',
    subtitle: '"Comigo não acontece"',
    color: 'text-sky-400',
    bgGlow: 'bg-sky-500/10',
    mindTrick: 'Você não constrói reserva de emergência ou cancela seguros porque o cérebro tem certeza de que doenças, quebras de carro ou demissões só ocorrem com os outros.',
    solution: 'Seja pessimista no plano e otimista na vida. Montar reserva não atrai azar, atrai paz mental. Assuma matematicamente que ao menos 1 imprevisto ocorrerá neste ano.'
  },
  {
    id: 'endowment',
    icon: <HandHeart size={28} />,
    title: 'Viés de Propriedade',
    subtitle: 'O apego irracional',
    color: 'text-indigo-400',
    bgGlow: 'bg-indigo-500/10',
    mindTrick: 'Você supervaloriza itens só porque são seus. Por isso recusa-se a vender um carro problemático ou roupas encostadas, exigindo um valor que ninguém paga.',
    solution: 'Faça o teste da não-posse: "Se eu tivesse R$ X em dinheiro agora em vez desse objeto, eu compraria ele de novo?". Se a resposta for não, venda imediatamente.'
  },
  {
    id: 'self_licensing',
    icon: <Award size={28} />,
    title: 'Autolicenciamento',
    subtitle: 'A desculpa do "Eu mereço"',
    color: 'text-fuchsia-400',
    bgGlow: 'bg-fuchsia-500/10',
    mindTrick: 'Após uma semana estressante ou bater uma meta, você sente que ganhou o "direito" moral de torrar dinheiro como recompensa, destruindo seu planejamento.',
    solution: 'Separe as emoções. Crie recompensas gratuitas (um tempo livre, um filme) e coloque uma linha fixa no seu orçamento apenas para "Mimos", sem estourar o limite.'
  },
  {
    id: 'halo_effect',
    icon: <Star size={28} />,
    title: 'Efeito Halo',
    subtitle: 'O peso milionário da marca',
    color: 'text-violet-400',
    bgGlow: 'bg-violet-500/10',
    mindTrick: 'Seu cérebro assume que um produto é incrivelmente superior só porque a embalagem é bonita ou tem o logo de uma maçã, fazendo você pagar até 400% a mais.',
    solution: 'Desconstrua o produto. Foque puramente nos componentes e na utilidade. Compre desempenho e durabilidade, não status para mostrar a desconhecidos.'
  },
  {
    id: 'house_money',
    icon: <Coins size={28} />,
    title: 'Dinheiro de Cassino',
    subtitle: 'Avaliando mal o lucro',
    color: 'text-lime-400',
    bgGlow: 'bg-lime-500/10',
    mindTrick: 'Se você ganha um dinheiro inesperado num investimento (ou aposta), você o reinveste em coisas arriscadíssimas, como se aquele lucro não fosse seu dinheiro real.',
    solution: 'Tudo o que cai na sua conta vira patrimônio seu. Trate lucros e prêmios com a mesma frieza e cautela com que você investiria o salário do seu suor diário.'
  },
  {
    id: 'confirmation_bias',
    icon: <Search size={28} />,
    title: 'Viés de Confirmação',
    subtitle: 'A ilusão de estar certo',
    color: 'text-rose-300',
    bgGlow: 'bg-rose-400/10',
    mindTrick: 'Quando você "quer" muito comprar algo, você só pesquisa no YouTube e no Google opiniões que falam bem daquele item, ignorando cegamente os defeitos.',
    solution: 'Faça o papel de advogado do diabo ativamente. Antes de concluir a compra, jogue no Google: "Por que não comprar [produto]" ou "Piores defeitos do [produto]".'
  },
  {
    id: 'subscription_bleed',
    icon: <Repeat size={28} />,
    title: 'Sangramento Invisível',
    subtitle: 'A morte por assinaturas',
    color: 'text-blue-300',
    bgGlow: 'bg-blue-400/10',
    mindTrick: 'Pagar R$ 19,90 parece tão inofensivo que o cérebro não se importa. Ele não multiplica por 12 meses, gerando um acúmulo letal de assinaturas esquecidas.',
    solution: 'Faça o extermínio semestral. Cancele ABSOLUTAMENTE TODOS os serviços que não usou nas últimas 3 semanas. Se fizer falta, você reassina em 1 minuto depois.'
  },
  {
    id: 'paradox_choice',
    icon: <Compass size={28} />,
    title: 'Paralisia por Análise',
    subtitle: 'Opções demais, ação de menos',
    color: 'text-emerald-300',
    bgGlow: 'bg-emerald-400/10',
    mindTrick: 'Ao abrir a corretora e ver 300 opções de CDBs ou ações, você fica com tanto medo de fazer a escolha sub-ótima que acaba não investindo em nada.',
    solution: 'Bom o suficiente bate o perfeito que nunca acontece. Escolha um índice passivo amplo ou aplique uma regra simples de corte. A inércia cobra o imposto mais caro.'
  }
];

export function PsychologyModule() {
  const [activeTrap, setActiveTrap] = useState<string | null>(null);

  return (
    <div className="h-full w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER FLUTUANTE */}
      <div className="px-2 shrink-0">
        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <Brain className="text-indigo-400" /> Hackeando a Mente
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          Descubra os 20 vieses cognitivos que roubam o seu dinheiro silenciosamente
        </p>
      </div>

      {/* GRID DE ARMADILHAS (Agora com 20 itens) */}
      <div className="flex-1 overflow-y-auto pb-6 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {traps.map((trap) => {
            const isActive = activeTrap === trap.id;

            return (
              <div 
                key={trap.id} 
                className={`relative bg-white/5 backdrop-blur-sm border p-6 rounded-[2.5rem] transition-all duration-500 overflow-hidden cursor-pointer shadow-xl flex flex-col justify-between
                  ${isActive ? 'border-indigo-500/50 shadow-indigo-500/10 md:col-span-2 xl:col-span-2 row-span-2' : 'border-white/10 hover:border-white/30 hover:bg-white/10 min-h-[220px]'}`}
                onClick={() => !isActive && setActiveTrap(trap.id)}
              >
                {/* Brilho de fundo do card */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-all duration-500 ${isActive ? trap.bgGlow : 'opacity-0'}`} />

                {/* CONTEÚDO FRONTAL */}
                <div className="flex items-start justify-between relative z-10 w-full">
                  <div>
                    <div className={`p-3 rounded-2xl bg-black/20 border border-white/5 inline-block mb-4 ${trap.color}`}>
                      {trap.icon}
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1 leading-tight">{trap.title}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{trap.subtitle}</p>
                  </div>
                  
                  {isActive ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTrap(null); }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <div className="p-2 rounded-full border border-white/10 text-slate-500 group-hover:text-white transition-colors mt-2 shrink-0">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>

                {/* CONTEÚDO EXPANDIDO (Revelação da Armadilha) */}
                <div className={`transition-all duration-500 overflow-hidden relative z-10 ${isActive ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* O Truque da Mente */}
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2 mb-3">
                          <ShieldAlert size={14}/> Como o cérebro te engana
                        </h4>
                        <p className="text-xs text-rose-100/90 leading-relaxed font-medium">
                          {trap.mindTrick}
                        </p>
                      </div>

                      {/* A Solução / Vacina */}
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 mb-3">
                          <Unlock size={14}/> A Cura do Hábito
                        </h4>
                        <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                          {trap.solution}
                        </p>
                      </div>
                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* MENSAGEM FINAL INSPIRADORA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 animate-in fade-in">
            <div className="p-5 bg-indigo-500/20 rounded-full text-indigo-300 shrink-0">
                <Sparkles size={32} />
            </div>
            <div>
                <h4 className="text-base font-black uppercase tracking-widest text-white mb-2">A consciência é o primeiro passo para a Riqueza</h4>
                <p className="text-xs font-medium text-indigo-200/80 leading-relaxed">
                  Grandes corporações e marqueteiros gastam bilhões de dólares todos os anos estudando como ativar esses exatos gatilhos na sua mente. Agora que você mapeou e conhece as regras do jogo, você reassume o controle do seu dinheiro e do seu futuro.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
}