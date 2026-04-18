import React from 'react';
import { 
  Zap, ShieldAlert, Rocket, History, 
  Coins, CreditCard, Cpu, Sparkles, Quote,
  Banknote, Landmark, ArrowRight, Fingerprint
} from 'lucide-react';

interface DashboardOverviewProps {
  theme?: string;
}

export function DashboardOverview({ theme = 'dark' }: DashboardOverviewProps) {
  const isLight = theme === 'light';

  return (
    <div className="relative h-full overflow-y-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-transparent">
      
      {/* 🖼️ FUNDO SUTIL (EFEITO PARALLAX DE MARCAS D'ÁGUA) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.02]">
        <Landmark size={400} className="absolute -top-20 -left-20 rotate-12" />
        <Coins size={300} className="absolute top-1/2 -right-20 -rotate-12" />
        <Cpu size={350} className="absolute -bottom-20 left-1/4 opacity-50" />
      </div>

      <div className="relative flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-2xl mx-auto px-6 py-16 lg:py-24">
        
        {/* --- CABEÇALHO REFINADO --- */}
        <header className="space-y-6">
          <div className="flex items-center gap-3 opacity-50">
            <Fingerprint size={16} className="text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Intelligence Protocol</span>
          </div>
          
          <h1 className={`text-5xl lg:text-6xl font-black italic tracking-tighter leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            A Evolução do <br/> 
            <span className="text-indigo-500 underline decoration-indigo-500/20">Domínio Financeiro</span>
          </h1>
          
          <p className={`text-lg font-medium leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
            Entender o passado é a única forma de não ser devorado pelo futuro. O dinheiro mudou, as armadilhas evoluíram, e você precisa entender como chegamos aqui.
          </p>
        </header>

        {/* --- NARRATIVA HISTÓRICA --- */}
        <section className="space-y-12 text-lg leading-relaxed font-medium opacity-90">
          
          {/* O Escambo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-500">
               <History size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">A Origem</span>
            </div>
            <p>
              No início, a economia era simétrica. O **Escambo** exigia uma troca de valor real: meu trigo pelo seu gado. Não havia dívida, apenas a troca direta de esforço por sobrevivência.
            </p>
          </div>

          {/* A Ascensão dos Bancos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-500">
               <Landmark size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">O Sistema</span>
            </div>
            <p>
              Com o tempo, surgiram os **Bancos**. O que começou como um lugar seguro para guardar ouro transformou-se na maior engenharia de controle da história. Eles descobriram que podiam emprestar dinheiro que não possuíam, criando a **Moeda Fiduciária**.
            </p>
            <p>
              A força dos bancos cresceu através da conveniência. Eles tornaram o consumo fácil, mas a liberdade cara. Ao longo das décadas, o sistema foi desenhado para que você dependa de empréstimos, financiamentos e cartões, criando um ciclo de **endividamento perpétuo** que consome sua energia vital antes mesmo de você recebê-la.
            </p>
          </div>

          {/* A Era Digital */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-500">
               <CreditCard size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">A Invisibilidade</span>
            </div>
            <p>
              Hoje, os juros abusivos e o marketing agressivo agem no seu subconsciente. O dinheiro tornou-se invisível, digital e algorítmico, facilitando vazamentos financeiros que você nem percebe. Você não está apenas comprando produtos; você está financiando o sistema que o mantém preso.
            </p>
          </div>
        </section>

        {/* --- O GANCHO VITTA --- */}
        <section className="py-12 text-center">
          <div className="inline-block p-1 bg-indigo-500/10 rounded-full mb-6">
            <div className="bg-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase text-white">
              A Virada de Chave
            </div>
          </div>
          <h2 className={`text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            E é exatamente aqui que a <span className="text-indigo-500">VittaCash</span> vai ajudar você.
          </h2>
        </section>

        {/* --- CITAÇÃO --- */}
        <section className="py-6 border-y border-indigo-500/10 flex flex-col items-center text-center space-y-4">
          <Quote size={32} className="text-indigo-500/20" />
          <blockquote className={`text-2xl italic font-light ${isLight ? 'text-slate-800' : 'text-white/80'}`}>
            "Ninguém é mais escravo do que aquele que se julga livre sem sê-lo."
          </blockquote>
          <cite className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">— Johann Wolfgang von Goethe</cite>
        </section>

        {/* --- MANUAL DE SOBREVIVÊNCIA --- */}
        <section className="space-y-12">
          <div className="flex items-center gap-3">
             <ShieldAlert className="text-rose-500" size={24} />
             <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Manual de Sobrevivência
             </h3>
          </div>

          <div className={`space-y-10 text-lg leading-relaxed ${isLight ? 'text-slate-700' : 'text-white/80'}`}>
            <div className="space-y-2">
              <h4 className="font-black text-indigo-500 uppercase text-xs tracking-widest">Protocolo I: O Despertar</h4>
              <p>
                O primeiro passo é a honestidade radical. O **Diagnóstico** do VittaCash revela a simetria real entre sua receita e seus vazamentos. Não olhe para os números apenas como dinheiro, mas como horas de vida protegidas ou perdidas.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-indigo-500 uppercase text-xs tracking-widest">Protocolo II: Oxigênio Financeiro</h4>
              <p>
                Sua independência é medida pelo tempo. A reserva de oxigênio é o que impede você de se ajoelhar para o sistema bancário quando imprevistos acontecem. Nossa meta é tirar você da dependência do crédito.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-indigo-500 uppercase text-xs tracking-widest">Protocolo III: Blindagem de Dados</h4>
              <p>
                Ao centralizar seu controle aqui, você cria um escudo contra o marketing de consumo. O consultor digital não dorme e estará sempre pronto para alertar quando sua liberdade estiver sob ataque.
              </p>
            </div>
          </div>
        </section>

        {/* --- FOOTER FINAL --- */}
        <footer className="pt-20 pb-32 text-center space-y-8">
          <Sparkles className="mx-auto text-indigo-500 opacity-50" size={32} />
          
          <div className="space-y-2">
            <p className={`text-xl font-black italic tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Assuma o comando da sua história.
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] opacity-30">
              VittaCash v3.0 // The New Economic Order
            </p>
          </div>

          <div className="pt-8">
            <div className="flex justify-center gap-4">
               <div className="w-12 h-[1px] bg-indigo-500/20 self-center" />
               <ArrowRight size={20} className="text-indigo-500 animate-bounce-x" />
               <div className="w-12 h-[1px] bg-indigo-500/20 self-center" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}