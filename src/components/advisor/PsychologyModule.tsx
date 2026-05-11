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
 },
 {
 id: 'dunning_kruger',
 icon: <Brain size={28} />,
 title: 'Efeito Dunning-Kruger',
 subtitle: 'A superconfiança cega',
 color: 'text-orange-300',
 bgGlow: 'bg-orange-400/10',
 mindTrick: 'Depois de acertar dois investimentos fáceis ou ler um livro, seu cérebro afirma que você é um gênio financeiro, levando a apostas absurdamente arriscadas.',
 solution: 'Assuma a posição de eterno aprendiz. Questione todas as suas "certezas absolutas". Bons investidores lucram porque conhecem exatamente os limites de sua própria ignorância.'
 },
 {
 id: 'framing_effect',
 icon: <Crosshair size={28} />,
 title: 'Efeito de Enquadramento',
 subtitle: 'R$ 1 real por dia',
 color: 'text-blue-300',
 bgGlow: 'bg-blue-400/10',
 mindTrick: 'Vendedores anunciam "Por menos de um cafézinho ao dia" para um seguro ou carro. Seu subconsciente pensa no preço do café (R$ 5) e esquece que o total dá R$ 1.800 no ano.',
 solution: 'Sempre converta custos diários para custos anuais antes de assinar qualquer contrato. A mente processa a dor imediata e subestima o vazamento de longo prazo.'
 },
 {
 id: 'loss_aversion',
 icon: <TrendingUp size={28} />,
 title: 'Viés da Aversão à Perda',
 subtitle: 'O terror de perder R$1',
 color: 'text-rose-500',
 bgGlow: 'bg-rose-500/10',
 mindTrick: 'A dor emocional de perder R$ 100 é 2x mais forte do que a alegria de ganhar R$ 100. Pelo medo, você deixa dinheiro mofando na Poupança (e perdendo pra inflação).',
 solution: 'Entenda que não investir hoje já é uma perda garantida chamada Inflação. Risco controlado é o "pedágio" inevitável na estrada do enriquecimento.'
 },
 {
 id: 'recency_bias',
 icon: <Repeat size={28} />,
 title: 'Viés de Recência',
 subtitle: 'O passado recente dita o futuro',
 color: 'text-cyan-300',
 bgGlow: 'bg-cyan-400/10',
 mindTrick: 'Se a bolsa caiu ontem, você acha que vai continuar caindo para sempre. Se está subindo, você acha que nunca mais vai cair. Você projeta o hoje no amanhã eterno.',
 solution: 'Ciclos econômicos duram anos, não dias. Ignore o pânico das manchetes diárias. Para ter retornos acima da média, compre quando estão chorando e venda quando estão rindo.'
 },
 {
 id: 'gamblers_fallacy',
 icon: <Coins size={28} />,
 title: 'Falácia do Apostador',
 subtitle: 'A sorte deve mudar',
 color: 'text-yellow-500',
 bgGlow: 'bg-yellow-500/10',
 mindTrick: 'Oibr3 e Americanas caíram 8 vezes seguidas. Seu cérebro diz: "Pronto, agora não pode cair mais, o preço TÁ MUITO BARATO!". O mercado não tem memória.',
 solution: 'Empresas ou ativos ruins podem e vão a Zero. Não invista só porque algo "já caiu muito". Siga os fundamentos do negócio e não a matemática fantasiosa dos cassinos.'
 },
 {
 id: 'ikea_effect_finance',
 icon: <HandHeart size={28} />,
 title: 'Efeito IKEA',
 subtitle: 'Cegueira pelo próprio labor',
 color: 'text-indigo-300',
 bgGlow: 'bg-indigo-400/10',
 mindTrick: 'Você dedicou três dias analisando uma ação e criando planilhas pra ela. Agora, mesmo quando o resultado é ruim, você se recusa a vendê-la porque "deu muito trabalho".',
 solution: 'Apaixone-se pelo lucro, não pelos ativos ou pela sua própria habilidade de análise. Se os números mudaram, rasgue a planilha sorrindo e vá para onde o dinheiro está.'
 },
 {
 id: 'status_quo',
 icon: <Anchor size={28} />,
 title: 'Status Quo Destrutivo',
 subtitle: 'A escravidão da Inércia',
 color: 'text-purple-300',
 bgGlow: 'bg-purple-400/10',
 mindTrick: 'Você paga anuidade de cartão de crédito e tarifas num banco clássico há anos apenas porque "dá preguiça de mudar tudo". Essa preguiça enriquece os grandes.',
 solution: 'Faça o "Dia da Mudança". São necessários apenas 15 minutos pelo celular para abrir contas de correntes e corretagens gratuitas hoje em dia. Sua preguiça custa muito caro.'
 },
 {
 id: 'illusion_control',
 icon: <Sparkles size={28} />,
 title: 'Ilusão de Controle',
 subtitle: 'O "Timing" Perfeito',
 color: 'text-teal-300',
 bgGlow: 'bg-teal-400/10',
 mindTrick: 'Você retarda seus aportes mensais jurando que vai comprar exatamente na "baixa" suprema do mês. Seu ego acha que vai cravar o ponto final do gráfico.',
 solution: 'Ninguém, nem Warren Buffett, acerta o poço ou o topo repetidas vezes. Pratique o DCA (feche os olhos e invista todo mês no mesmo dia, independente do noticiário).'
 },
 {
 id: 'hyperbolic_discounting',
 icon: <Rocket size={28} />,
 title: 'Desconto Hiperbólico',
 subtitle: 'Miojo hoje, Filé amanhã',
 color: 'text-amber-500',
 bgGlow: 'bg-amber-500/10',
 mindTrick: 'O cérebro prefere ganhar R$ 1.000 agora do que aguardar para receber R$ 1.500 no ano que vem. O animal dentro de nós odeia esperar.',
 solution: 'Concretize o seu "Eu do Futuro". Troque nomes das suas contas como "Poupança" para "Sua Aposentadoria na Praia aos 50 Anos". Deixe seu cérebro lutar pelo prêmio real.'
 },
 {
 id: 'artificial_scarcity',
 icon: <Flame size={28} />,
 title: 'Escassez Artificial',
 subtitle: 'Últimas 2 unidades',
 color: 'text-red-400',
 bgGlow: 'bg-red-500/10',
 mindTrick: 'A mente dispara o alerta primitivo de sobrevivência quando vê o contador dizendo: "Promoção Expirando em 00:03". O medo paralisa a parte racional do cérebro.',
 solution: 'Feche o site ou saia da loja. Pense por 1 hora e lembre-se: 99% desses cronômetros zeram e a "promoção" continua no dia seguinte, eles são só scripts de computador.'
 },
 {
 id: 'planning_fallacy',
 icon: <Sun size={28} />,
 title: 'Falácia do Planejamento',
 subtitle: 'Tudo dará certo e no prazo',
 color: 'text-pink-300',
 bgGlow: 'bg-pink-400/10',
 mindTrick: 'Orçar uma reforma ou assumir uma grande dívida apostando que "com certeza vou ser promovido" ou "a obra vai custar exatamente os R$ 20.000 calculados".',
 solution: 'Multiplique orçamentos de projetos longos (como obras) ou metas de poupança difíceis por 1.5 logo de início. Assim você já joga no hard e nunca é pego descalço.'
 },
 {
 id: 'symbolic_contribution',
 icon: <Award size={28} />,
 title: 'Contribuição Simbólica',
 subtitle: 'Enganando a consciência',
 color: 'text-slate-300',
 bgGlow: 'bg-slate-400/10',
 mindTrick: 'Você poupa os R$ 50 redondos que "sobraram", sem corrigir os valores a vida toda, e o seu cérebro deita no travesseiro com a sensação de missão perfeitamente cumprida.',
 solution: 'A inflação devora seus R$ 50 de dez anos atrás. Todo mês de Janeiro ou após aumentos você DEVE subir o % absoluto a ser investido, acompanhando seu avanço de vida.'
 },
 {
 id: 'nomimal_value_illusion',
 icon: <Tag size={28} />,
 title: 'Ilusão do Valor Nominal',
 subtitle: 'A miragem estatística',
 color: 'text-violet-300',
 bgGlow: 'bg-violet-400/10',
 mindTrick: 'Você comemora porque seu apartamento subiu "O Triplo" (100k para 300k) em 20 anos. Esquece que uma cesta básica subiu 5 vezes no mesmo período.',
 solution: 'Tome as decisões focadas no Juro Real e Poder de Compra. "Com esse dinheiro eu compro quantos litros de gasolina hoje vs ontem?" Desconte sempre a inflação do cálculo.'
 },
 {
 id: 'blind_spot_bias',
 icon: <EyeOff size={28} />,
 title: 'Viés do Ponto Cego',
 subtitle: '"Consigo ver os outros, mas eu não"',
 color: 'text-fuchsia-300',
 bgGlow: 'bg-fuchsia-400/10',
 mindTrick: 'Saber ler sobre essas armadilhas lhe dá a impressão reconfortante de que você "agora está imune", mas acha que as massas e as outras pessoas nas lojas ainda cairão.',
 solution: 'A arrogância da imunidade é o último degrau antes da queda. Aceite que a química do seu cérebro é igual a dos outros; continue implementando blindagens rigorosas e processos.'
 },
 {
 id: 'clustering_illusion',
 icon: <Search size={28} />,
 title: 'Ilusão de Agrupamento',
 subtitle: 'O misticismo do gráfico',
 color: 'text-lime-300',
 bgGlow: 'bg-lime-400/10',
 mindTrick: 'O cérebro humano evoluiu para achar sentido no caos. Você olha gráficos de ações que se movem aleatoriamente e enxerga padrões perfeitos onde "agora a crise vem certinha".',
 solution: 'Assuma volatilidade como ruído branco. Invista pela qualidade dos ativos/empresas que distribuem recursos consistentes, não pelas figuras lúdicas nos gráficos das ações.'
 },
 {
 id: 'halo_influencer',
 icon: <Users size={28} />,
 title: 'Halo do Influenciador',
 subtitle: 'Dando moral a quem não se deve',
 color: 'text-indigo-400',
 bgGlow: 'bg-indigo-500/10',
 mindTrick: 'Se um guru fala bonito e mora numa casa rica em Dubai vendendo curso, seu cérebro presume imediatamente que os investimentos e dicas super arriscadas dele são lei irrefutável.',
 solution: 'Investidores profissionais fazem carreira quieta e chata. Pessoas exibindo excesso de opulência na internet em troca das suas visualizações costumam enriquecer do seu engajamento, não daquele portfólio.'
 },
 {
 id: 'focus_illusion',
 icon: <Crosshair size={28} />,
 title: 'Efeito de Foco Direcional',
 subtitle: 'A miopia analítica',
 color: 'text-blue-500',
 bgGlow: 'bg-blue-500/10',
 mindTrick: 'Ficar obcecado em não pedir um Ifood de R$ 30 (sofre por horas calculando centavos) e à tarde fecha a compra de um carro com taxa abusiva escondida "só para resolver logo".',
 solution: 'Faça a gestão macro do tempo. Esforce-se em lutar contra onde perde milhares: taxas do consignado, juros do financiamento imobiliário e os maus seguros na hora grande.'
 },
 {
 id: 'reaction_bias',
 icon: <Flame size={28} />,
 title: 'Reatância Psicológica',
 subtitle: 'Comprar por rebeldia adolescente',
 color: 'text-rose-600',
 bgGlow: 'bg-rose-600/10',
 mindTrick: 'Seu assessor ou amigos bons lhe disseram: "Essa moeda/mercado é lixo tóxico, ninguém deve tocar nisso". Pelo simples desafio da proibição, o cérebro quer participar pra provar o contrário.',
 solution: 'Ego não paga boleto. Mercado financeiro pune cruelmente os rebeldes que não têm bases lógicas sólidas para a inversão do consenso. Siga o fluxo ou vá contra de forma blindada.'
 },
 {
 id: 'residual_money_bias',
 icon: <CreditCard size={28} />,
 title: 'Viés do Resto do Caixa',
 subtitle: '"Pago minhas contas, depois invisto"',
 color: 'text-emerald-500',
 bgGlow: 'bg-emerald-500/10',
 mindTrick: 'Recebe o salário, paga aluguel, paga cartão e deixa R$ 300 pra viver o mês. Você confia ingenuamente que, se sobrar no dia 31, você investe. A conta corrente, surpreendentemente, nunca sobra nada.',
 solution: 'O sistema "Pague-se Primeiro". No instante que o salário cai no dia 5. Você arranca pra corretora os 10 ou 20%. O seu custo de vida no restante dos 30 dias vai DEVERÁ se achatar forçosamente pro restante do saldo natural.'
 }
];

export function PsychologyModule({ theme = 'dark' }: { theme?: string }) {
  const isLight = theme === 'light';
  const [activeTrap, setActiveTrap] = useState<string | null>(null);

 return (
 <div className="h-full w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
 
 {/* HEADER FLUTUANTE */}
 <div className="px-2 shrink-0">
 <h2 className={`text-2xl font-black uppercase tracking-tighter flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
 <Brain className="text-indigo-400" /> Hackeando a Mente
 </h2>
 <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest mt-1`}>
 Descubra os 40 vieses cognitivos que roubam o seu dinheiro silenciosamente
 </p>
 </div>

 {/* 💡 MENSAGEM INSPIRADORA (TOPO) */}
 <div className={`shrink-0 p-5 ${isLight ? 'bg-indigo-50 border border-indigo-100' : 'bg-gradient-to-r from-indigo-900/40 to-purple-900/40'} rounded-[2rem] flex items-center gap-5`}>
 <div className={`p-4 ${isLight ? 'bg-indigo-500/10 text-indigo-600' : 'bg-indigo-500/20 text-indigo-300'} rounded-full shrink-0`}>
 <Sparkles size={24} />
 </div>
 <div>
 <h4 className={`text-sm font-black uppercase tracking-widest ${isLight ? 'text-indigo-900' : 'text-white'} mb-1`}>A Consciência é o Primeiro Passo para a Riqueza</h4>
 <p className={`text-[10px] font-medium ${isLight ? 'text-indigo-700/80' : 'text-indigo-200/70'} leading-relaxed`}>
 Grandes corporações gastam bilhões estudando como ativar esses gatilhos na sua mente. Agora que você conhece as regras do jogo, você reassume o controle do seu dinheiro.
 </p>
 </div>
 </div>

 {/* GRID DE ARMADILHAS */}
 <div className="flex-1 overflow-y-auto pb-6 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 
 {traps.map((trap) => {
 const isActive = activeTrap === trap.id;

 return (
 <div 
 key={trap.id} 
 className={`relative rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-center
 ${isLight ? 'bg-white border border-slate-200 shadow-sm' : 'bg-white/5 backdrop-blur-xl'}
 ${isActive ? 'md:col-span-2 xl:col-span-2 row-span-2 p-6 rounded-[2.5rem] ' + (isLight ? 'bg-slate-50 border-indigo-200' : 'bg-white/10') : 'hover:bg-white/10 p-4'}`}
 onClick={() => !isActive && setActiveTrap(trap.id)}
 >
 {/* Brilho de fundo do card */}
 <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none transition-all duration-500 ${isActive ? trap.bgGlow : 'opacity-0'}`} />

 {/* CONTEÚDO FRONTAL */}
 <div className={`flex ${isActive ? 'flex-col items-start justify-between' : 'flex-row items-center justify-between'} relative z-10 w-full`}>
 <div className={`flex ${isActive ? 'flex-col items-start' : 'items-center gap-3'} w-full`}>
 <div className={`p-2.5 rounded-2xl bg-black/20 ${isActive ? 'mb-4' : ''} ${trap.color} shrink-0`}>
 {trap.icon}
 </div>
 <div className="flex-1 min-w-0 pr-2">
 <h3 className={`font-black uppercase tracking-widest leading-tight ${isLight ? 'text-slate-900' : 'text-white'} ${isActive ? 'text-sm mb-1 whitespace-normal' : 'text-[10px] truncate'}`}>{trap.title}</h3>
 {isActive && <p className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{trap.subtitle}</p>}
 </div>
 </div>
 
 {isActive ? (
 <button 
 onClick={(e) => { e.stopPropagation(); setActiveTrap(null); }}
 className={`absolute right-0 top-0 p-2 rounded-full ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'} transition-colors shrink-0`}
 >
 <X size={16} />
 </button>
 ) : (
 <div className="p-1.5 rounded-full text-slate-500 group-hover:text-white transition-colors shrink-0">
 <ChevronRight size={16} />
 </div>
 )}
 </div>

 {/* CONTEÚDO EXPANDIDO (Revelação da Armadilha) */}
 <div className={`transition-all duration-500 overflow-hidden relative z-10 ${isActive ? 'max-h-[500px] mt-6 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* O Truque da Mente */}
 <div className={`${isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-500/20'} rounded-2xl p-5`}>
 <h4 className="text-[9px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2 mb-3">
 <ShieldAlert size={14}/> Como o cérebro te engana
 </h4>
 <p className={`text-xs ${isLight ? 'text-rose-900' : 'text-rose-100/90'} leading-relaxed font-medium`}>
 {trap.mindTrick}
 </p>
 </div>

 {/* A Solução / Vacina */}
 <div className={`${isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'} rounded-2xl p-5`}>
 <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 mb-3">
 <Unlock size={14}/> A Cura do Hábito
 </h4>
 <p className={`text-xs ${isLight ? 'text-emerald-900' : 'text-emerald-100/90'} leading-relaxed font-medium`}>
 {trap.solution}
 </p>
 </div>
 </div>
 </div>

 </div>
 );
 })}

 </div>

 </div>
 </div>
 );
}

