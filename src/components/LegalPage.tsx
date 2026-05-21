import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, Cookie } from 'lucide-react';

const LegalPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const content = {
    privacy: {
      title: 'Política de Privacidade',
      icon: <ShieldCheck size={32} className="text-emerald-500" />,
      text: `
        Esta Política de Privacidade descreve como o A2 Mentor coleta, utiliza e protege suas informações pessoais.
        
        1. Coleta de Dados: Coletamos apenas os dados necessários para o funcionamento da plataforma, como e-mail e dados financeiros inseridos voluntariamente.
        2. Proteção: Utilizamos criptografia de ponta a ponta e protocolos de segurança rigorosos para garantir a integridade dos seus dados.
        3. Uso: Seus dados financeiros NUNCA são compartilhados com terceiros. Eles servem exclusivamente para gerar seus relatórios e insights de IA.
        4. Seus Direitos: De acordo com a LGPD, você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento através das configurações do seu perfil.
      `
    },
    terms: {
      title: 'Termos de Uso',
      icon: <FileText size={32} className="text-blue-500" />,
      text: `
        Ao utilizar o A2 Mentor, você concorda com os seguintes termos e condições:
        
        1. Licença de Uso: Concedemos uma licença pessoal e intransferível para uso da plataforma de acordo com o plano contratado.
        2. Responsabilidade: O usuário é o único responsável pela veracidade dos dados inseridos e pelas decisões financeiras tomadas com base nos insights gerados.
        3. Assinaturas: Os planos pagos são renovados automaticamente, a menos que cancelados pelo usuário através da plataforma de pagamento utilizada (Kiwify).
        4. Modificações: Reservamo-nos o direito de atualizar a plataforma e estes termos para melhorar a experiência do usuário.
      `
    },
    cookies: {
      title: 'Aviso de Cookies',
      icon: <Cookie size={32} className="text-amber-500" />,
      text: `
        Utilizamos cookies para melhorar sua experiência de navegação e funcionalidade da plataforma.
        
        1. O que são: Cookies são pequenos arquivos armazenados no seu navegador para lembrar suas preferências.
        2. Necessários: Alguns cookies são essenciais para manter sua sessão ativa e segura.
        3. Analíticos: Podemos usar cookies de terceiros para entender como os usuários utilizam o site e melhorar nossos serviços.
        4. Controle: Você pode desativar os cookies nas configurações do seu navegador, mas isso pode afetar o funcionamento de algumas partes do A2 Mentor.
      `
    },
    security: {
      title: 'Segurança de Dados',
      icon: <ShieldCheck size={32} className="text-cyan-500" />,
      text: `
        A segurança dos seus dados é nossa prioridade absoluta.
        
        1. Criptografia: Todos os dados transmitidos entre seu dispositivo e nossos servidores são protegidos por criptografia SSL/TLS de 256 bits.
        2. Isolamento: Utilizamos arquitetura multitenant com isolamento rigoroso de banco de dados por usuário via Supabase RLS.
        3. Backup: Realizamos backups diários automatizados para garantir que suas informações nunca sejam perdidas.
        4. Anonimato: Insights de IA são processados de forma anonimizada, garantindo que nenhum dado sensível seja exposto.
      `
    }
  };

  const currentContent = content[type as keyof typeof content] || content.privacy;

  return (
    <div className="min-h-screen bg-[#283593] text-white font-sans p-6 md:p-12 pt-24 md:pt-32 animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex flex-col items-center text-center mb-12">
          <div className="p-4 bg-white/5 rounded-2xl mb-6 shadow-xl">{currentContent.icon}</div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-4">{currentContent.title}</h1>
          <div className="h-1 w-20 bg-emerald-500/30 rounded-full" />
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-zinc-300 text-sm md:text-base leading-loose whitespace-pre-line font-medium">
            {currentContent.text}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-2">A2 Mentor Compliance</p>
          <p className="text-[9px] font-bold text-zinc-600 uppercase italic">A2soluntions Desenvolvimento de Sistemas</p>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
