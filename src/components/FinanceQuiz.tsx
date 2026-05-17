import React, { useState, useEffect } from 'react';
import { 
 GraduationCap, Trophy, Target, ArrowRight, 
 RotateCcw, CheckCircle2, AlertCircle, Sparkles, 
 Brain, Zap, ShieldCheck, Lock, Swords, Flame
} from 'lucide-react';

interface Question {
 id: number;
 question: string;
 options: string[];
 correct: number;
 explanation: string;
}

// 20 Perguntas divididas em 4 Fases (5 perguntas por fase)
const questionsPool: Question[] = [
 // FASE 1: O DESPERTAR (Básico)
 { id: 1, question: "O que é o 'Efeito Diderot'?", options: ["Guardar 10%", "Uma compra que gera outras compras", "Pedir desconto", "Pagar à vista"], correct: 1, explanation: "Uma compra nova cria uma espiral de consumo para 'combinar' o ambiente." },
 { id: 2, question: "Qual a regra A2Finanças para aumentos?", options: ["Gastar tudo", "Mudar de casa", "50% Investir / 50% Viver", "Comprar um carro"], correct: 2, explanation: "Isso trava a inflação do seu estilo de vida." },
 { id: 3, question: "O que é Custo Irrecuperável?", options: ["Dinheiro perdido", "Investir no erro por já ter gasto muito", "Taxa de banco", "Preço de revenda"], correct: 1, explanation: "Não jogue dinheiro bom em cima de dinheiro ruim." },
 { id: 4, question: "Pagar com Pix gera qual efeito?", options: ["Economia", "Anestesia do pagamento", "Mais cashback", "Segurança total"], correct: 1, explanation: "A falta de dinheiro físico faz o cérebro 'sentir' menos a perda." },
 { id: 5, question: "O que é Reserva de Emergência?", options: ["Limite do cartão", "Dinheiro para imprevistos", "Empréstimo de parentes", "Saldo do FGTS"], correct: 1, explanation: "É o seu seguro contra o caos da vida." },
 
 // FASE 2: BLINDAGEM MENTAL
 { id: 6, question: "O que é Ancoragem de Preço?", options: ["Preço justo", "Focar no valor riscado (De/Por)", "Comparar 10 lojas", "Preço de custo"], correct: 1, explanation: "O marketing usa um preço alto falso para fazer o atual parecer barato." },
 { id: 7, question: "Viés de Confirmação é:", options: ["Confirmar o Pix", "Buscar só opiniões que aprovam sua compra", "Checar o extrato", "Validar a senha"], correct: 1, explanation: "Você ignora os defeitos porque quer muito o objeto." },
 { id: 8, question: "O que é Autolicenciamento?", options: ["Ter CNH", "O 'eu mereço' após um dia ruim", "Abrir uma empresa", "Pagar as contas"], correct: 1, explanation: "Usar uma boa ação como desculpa para gastar errado depois." },
 { id: 9, question: "Efeito Halo nas marcas:", options: ["Desconto de 50%", "Achar que tudo da marca X é perfeito", "Marca de luxo", "Logo brilhante"], correct: 1, explanation: "Você paga mais pelo logo do que pela qualidade real." },
 { id: 10, question: "Aversão à Perda causa:", options: ["Medo de ganhar", "Segurar investimentos ruins por medo de realizar prejuízo", "Gastar pouco", "Perder a carteira"], correct: 1, explanation: "O cérebro sofre 2x mais com a perda do que se alegra com o ganho." },

 // FASE 3: ESTRATEGISTA AVANÇADO (As outras 10 perguntas seguem o mesmo padrão...)
 { id: 11, question: "Contabilidade Mental faz você:", options: ["Gastar mais dinheiro extra/bônus", "Fazer planilhas", "Pagar impostos", "Economizar no café"], correct: 0, explanation: "Você trata dinheiro 'fácil' com menos respeito que o salário." },
 { id: 12, question: "Fadiga de Decisão ocorre quando:", options: ["Você dorme muito", "Toma decisões ruins no fim do dia", "Caminha muito", "Lê contratos"], correct: 1, explanation: "Sua força de vontade é uma bateria que descarrega." },
 { id: 13, question: "Efeito Manada é:", options: ["Comprar gado", "Seguir a multidão em investimentos/compras", "Trabalhar em grupo", "Viajar em família"], correct: 1, explanation: "O medo de ficar de fora (FOMO) faz você agir sem pensar." },
 { id: 14, question: "A Gratificação Instantânea prioriza:", options: ["O futuro", "O prazer de agora", "A aposentadoria", "O estudo"], correct: 1, explanation: "O cérebro quer dopamina agora, ignorando o boleto de amanhã." },
 { id: 15, question: "O 'Sangramento Invisível' são:", options: ["Dívidas grandes", "Pequenas assinaturas esquecidas", "Roubos", "Altos impostos"], correct: 1, explanation: "R$ 20 aqui e ali destroem seu patrimônio no longo prazo." },

 // FASE 4: MESTRE DO VITTA CASH
 { id: 16, question: "O que é ser 'Co-Host'?", options: ["Dono de hotel", "Gerenciar Airbnb de terceiros", "Viajar grátis", "Limpar casas"], correct: 1, explanation: "É uma forma de renda extra sem precisar ter o imóvel." },
 { id: 17, question: "A 'Regra das 48 Horas' serve para:", options: ["Dormir mais", "Esperar o impulso de compra passar", "Pagar o boleto", "Limpar a casa"], correct: 1, explanation: "Se após 2 dias você ainda quiser, a compra é consciente." },
 { id: 18, question: "A 'Paralisia por Análise' ocorre ao:", options: ["Ter pouca opção", "Ter opções demais e não escolher nenhuma", "Estar cansado", "Ficar sem internet"], correct: 1, explanation: "Excesso de escolha gera medo de errar e trava a ação." },
 { id: 19, question: "Otimismo Tóxico Financeiro é:", options: ["Acreditar que vai ganhar na mega", "Achar que nunca terá imprevistos", "Ser feliz", "Investir em ações"], correct: 1, explanation: "Faz você ignorar a necessidade de seguros e reservas." },
 { id: 20, question: "A Riqueza no A2Finanças é definida por:", options: ["Ter carros", "Liberdade e controle sobre o tempo", "Saldo alto no banco", "Gastar muito"], correct: 1, explanation: "Dinheiro é apenas a ferramenta para sua liberdade real." },
];

const phrases = [
 "Você é mais forte que qualquer impulso de marketing!",
 "Sua mente está se tornando uma fortaleza inabalável.",
 "Cada acerto é um tijolo na construção da sua liberdade.",
 "O mercado treina pessoas para gastar. O A2Finanças treina você para dominar!",
 "Você deixou de ser um escravo do consumo para ser o mestre do seu destino."
];

export function FinanceQuiz({ theme = 'dark' }: { theme?: string }) {
  const isLight = theme === 'light' || theme === 'white' || theme === 'white-orange';
  const [mode, setMode] = useState<'easy' | 'hard' | null>(null);
 const [phase, setPhase] = useState(1);
 const [currentInPhase, setCurrentInPhase] = useState(0); // 0 a 4
 const [selectedOption, setSelectedOption] = useState<number | null>(null);
 const [showResult, setShowResult] = useState(false);
 const [score, setScore] = useState(0);
 const [isFinished, setIsFinished] = useState(false);
 const [showPhrase, setShowPhrase] = useState(false);

 const currentQuestionIndex = (phase - 1) * 5 + currentInPhase;
 const q = questionsPool[currentQuestionIndex];

 const handleSelect = (idx: number) => {
 if (showResult) return;
 setSelectedOption(idx);
 setShowResult(true);
 if (idx === q.correct) setScore(s => s + 1);
 };

 const handleNext = () => {
 if (currentInPhase < 4) {
 setCurrentInPhase(c => c + 1);
 setSelectedOption(null);
 setShowResult(false);
 } else {
 // Fim de fase
 if (phase < 4) {
 setShowPhrase(true);
 } else {
 setIsFinished(true);
 }
 }
 };

 const nextPhase = () => {
 setPhase(p => p + 1);
 setCurrentInPhase(0);
 setSelectedOption(null);
 setShowResult(false);
 setShowPhrase(false);
 };

 if (!mode) {
 return (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
    <Swords size={64} className="text-indigo-500 mb-6" />
    <h2 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase tracking-tighter mb-4`}>Escolha seu Destino</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
      <button onClick={() => setMode('easy')} className={`group p-8 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 backdrop-blur-xl border-white/5'} rounded-[2.5rem] hover:border-emerald-500/50 transition-all border shadow-sm`}>
        <Zap className="text-emerald-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={40} />
        <h3 className={`${isLight ? 'text-slate-900' : 'text-white'} font-black uppercase`}>Modo Aprendiz</h3>
        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-2 font-bold uppercase tracking-widest`}>Respostas imediatas e explicações</p>
      </button>
      <button onClick={() => setMode('hard')} className={`group p-8 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 backdrop-blur-xl border-white/5'} rounded-[2.5rem] hover:border-rose-500/50 transition-all border shadow-sm`}>
        <Flame className="text-rose-500 mx-auto mb-4 group-hover:scale-110 transition-transform" size={40} />
        <h3 className={`${isLight ? 'text-slate-900' : 'text-white'} font-black uppercase`}>Modo Gladiador</h3>
        <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-2 font-bold uppercase tracking-widest`}>Sem dicas. Apenas os fortes sobrevivem.</p>
      </button>
    </div>
  </div>
 );
 }

 if (showPhrase) {
 return (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
    <div className={`${isLight ? 'bg-indigo-50 border-indigo-200 shadow-xl' : 'bg-white/5 backdrop-blur-xl border-white/5'} p-12 rounded-[3rem] max-w-lg border`}>
      <Sparkles className="text-yellow-500 mx-auto mb-6" size={60} />
      <h3 className={`text-2xl font-black ${isLight ? 'text-indigo-900' : 'text-white'} uppercase mb-4`}>{phrases[phase - 1]}</h3>
      <p className={`${isLight ? 'text-indigo-700' : 'text-indigo-200'} text-sm mb-8 font-medium`}>Você concluiu a Fase {phase}. Sua mente está mais afiada.</p>
      <button onClick={nextPhase} className={`w-full ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-950 hover:bg-indigo-50'} font-black py-4 rounded-2xl uppercase tracking-widest transition-all shadow-lg`}>
        Iniciar Fase {phase + 1}
      </button>
    </div>
  </div>
 );
 }

 if (isFinished) {
 return (
  <div className="h-full flex flex-col items-center justify-center animate-in zoom-in duration-500">
    <Trophy className="text-yellow-500 mb-4" size={80} />
    <h2 className={`text-4xl font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase italic`}>Mestre Supremo</h2>
    <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} font-bold mt-2`}>Você acertou {score} de 20 questões.</p>
    <button onClick={() => { setMode(null); setPhase(1); setIsFinished(false); setScore(0); }} className={`mt-8 px-10 py-4 ${isLight ? 'bg-indigo-600 text-white' : 'border border-white/20 text-white hover:bg-white/10'} rounded-full font-black uppercase transition-all shadow-lg`}>
      Reiniciar Jornada
    </button>
  </div>
 );
 }

 return (
 <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
 {/* HUD DE FASE */}
    <div className={`flex justify-between items-center px-4 ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 backdrop-blur-xl border-white/5'} p-4 rounded-[2rem] border shadow-sm`}>
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-indigo-500" size={24} />
        <div>
          <p className={`text-[8px] font-black ${isLight ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest`}>Nível Atual</p>
          <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'} uppercase`}>Fase {phase}: {phase === 1 ? 'O Despertar' : phase === 2 ? 'Blindagem' : phase === 3 ? 'Estrategista' : 'Mestre'}</h4>
        </div>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1.5 w-8 rounded-full ${i <= currentInPhase + 1 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : (isLight ? 'bg-slate-200' : 'bg-white/10')}`} />
        ))}
      </div>
    </div>

 {/* CARD DA PERGUNTA */}
 <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full">
 <div className={`w-full ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 backdrop-blur-xl border-white/5'} border p-10 rounded-[3rem] relative overflow-hidden shadow-sm`}>
 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block">Pergunta {currentInPhase + 1}/5</span>
 <h3 className={`text-xl md:text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'} mb-8 leading-tight`}>{q.question}</h3>

 <div className="grid gap-3">
 {q.options.map((opt, idx) => {
 let btnStyle = `${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`;
 
 if (showResult) {
 if (mode === 'easy') {
 if (idx === q.correct) btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
 else if (selectedOption === idx) btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-600";
 else btnStyle = "opacity-30 border-transparent";
 } else {
 // MODO HARD: Não mostra a correta se errou
 if (selectedOption === idx) {
 btnStyle = idx === q.correct 
 ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600" 
 : "bg-rose-500/20 border-rose-500/50 text-rose-600";
 } else {
 btnStyle = "opacity-30 border-transparent";
 }
 }
 }

 return (
 <button
 key={idx}
 disabled={showResult}
 onClick={() => handleSelect(idx)}
 className={`p-5 rounded-2xl text-left font-bold text-sm transition-all duration-300 border ${btnStyle}`}
 >
 {opt}
 </button>
 );
 })}
 </div>

 {showResult && mode === 'easy' && (
 <div className={`mt-6 p-4 ${isLight ? 'bg-indigo-50 border-indigo-200 text-indigo-950' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'} border rounded-2xl animate-in slide-in-from-top-2`}>
 <p className="text-[11px] leading-relaxed font-black italic">{q.explanation}</p>
 </div>
 )}
 </div>

    {showResult && (
      <button 
        onClick={handleNext} 
        className={`mt-8 group ${isLight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-950 hover:bg-indigo-50'} font-black uppercase px-12 py-5 rounded-full flex items-center gap-3 transition-all active:scale-95 shadow-xl`}
      >
        {currentInPhase === 4 ? "Finalizar Fase" : "Próxima Batalha"}
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    )}
 </div>
 </div>
 );
}
