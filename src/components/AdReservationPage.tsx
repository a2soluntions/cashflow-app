import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Megaphone, Send, Landmark, Calendar, MessageSquare, 
  HelpCircle, Monitor, Layout, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../supabase';

const AD_SLOTS_INFO = [
  { 
    type: 'ad_top', 
    label: 'Banner do Topo', 
    size: '970x250 px', 
    price: 'R$ 450,00', 
    period: 'por 30 dias',
    desc: 'Visibilidade máxima no topo de todas as páginas do portal.' 
  },
  { 
    type: 'ad_skin_left_home', 
    label: 'Lateral Esquerda (Skin)', 
    size: '200x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops. Acompanha o scroll do leitor à esquerda.' 
  },
  { 
    type: 'ad_skin_right_home', 
    label: 'Lateral Direita (Skin)', 
    size: '200x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops. Acompanha o scroll do leitor à direita.' 
  },
  { 
    type: 'ad_sidebar_1', 
    label: 'Sidebar Quadrado', 
    size: '300x300 px', 
    price: 'R$ 280,00', 
    period: 'por 30 dias',
    desc: 'Posicionado no início do painel lateral ao lado das notícias mais lidas.' 
  },
  { 
    type: 'ad_sidebar_2', 
    label: 'Sidebar Vertical', 
    size: '300x600 px', 
    price: 'R$ 320,00', 
    period: 'por 30 dias',
    desc: 'Skyscraper vertical posicionado na lateral das páginas de leitura.' 
  },
  { 
    type: 'ad_vittacash_horizontal', 
    label: 'Banner do Feed (Centro)', 
    size: '728x90 px', 
    price: 'R$ 240,00', 
    period: 'por 30 dias',
    desc: 'Banner de destaque inserido dinamicamente no meio do fluxo de notícias.' 
  }
];

export default function AdReservationPage() {
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState(AD_SLOTS_INFO[0].type);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [durationDays, setDurationDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cropAndResizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          // Recorte proporcional centralizado
          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;
          let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;

          if (imgRatio > targetRatio) {
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2;
          } else {
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2;
          }

          ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas conversion failed"));
            }
          }, file.type || 'image/jpeg', 0.95);
        };
        img.onerror = () => reject(new Error("Falha ao ler imagem"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sizeMap: Record<string, { w: number, h: number, label: string }> = {
        'ad_top': { w: 970, h: 250, label: 'Banner Topo' },
        'ad_vittacash_horizontal': { w: 728, h: 90, label: 'Banner de Centro' },
        'ad_skin_left_home': { w: 200, h: 600, label: 'Skin Esquerda' },
        'ad_skin_right_home': { w: 200, h: 600, label: 'Skin Direita' },
        'ad_sidebar_1': { w: 300, h: 300, label: 'Sidebar 1' },
        'ad_sidebar_2': { w: 300, h: 600, label: 'Sidebar 2' }
      };

      let finalFile: File | Blob = file;
      const targetDimensions = sizeMap[selectedSlot];

      if (targetDimensions) {
        const imgDimensions = await new Promise<{ w: number, h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.width, h: img.height });
          img.onerror = () => resolve({ w: 0, h: 0 });
          img.src = URL.createObjectURL(file);
        });

        if (imgDimensions.w !== targetDimensions.w || imgDimensions.h !== targetDimensions.h) {
          alert(`Ajustando imagem: Proporção original ${imgDimensions.w}x${imgDimensions.h}. O tamanho ideal é ${targetDimensions.w}x${targetDimensions.h}. Faremos o ajuste e recorte proporcional automático.`);
          finalFile = await cropAndResizeImage(file, targetDimensions.w, targetDimensions.h);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = Math.random().toString() + "." + fileExt;
      const filePath = "publicity-uploads/" + fileName;

      const { error: uploadError } = await supabase.storage
        .from('vitta-assets')
        .upload(filePath, finalFile, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('vitta-assets')
        .getPublicUrl(filePath);

      setAdImageUrl(data.publicUrl);
      alert("Sucesso! Imagem carregada e ajustada.");
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !adImageUrl) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const selectedInfo = AD_SLOTS_INFO.find(s => s.type === selectedSlot);
      const { error } = await supabase.from('site_content').insert({
        id: crypto.randomUUID(),
        content_type: `request_${selectedSlot}`,
        title: `${selectedInfo?.label || 'Reserva'} - ${clientName}`,
        image_url: adImageUrl,
        description: `Duração: ${durationDays} dias. Solicitante: ${clientName} (${clientEmail} | ${clientPhone})`,
        is_active: false,
        meta_value: {
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          duration_days: durationDays,
          external_url: adTargetUrl,
          slot_type: selectedSlot,
          price_quoted: selectedInfo?.price || 'Sob Consulta',
          requested_at: new Date().toISOString()
        }
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao processar sua solicitação de reserva.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => navigate('/noticias')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Portal
        </button>
        <span className="text-xl font-black italic tracking-tighter uppercase">
          Vitta <span className="text-indigo-500">Publicidade</span>
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LADO ESQUERDO: Posicionamento dos Campos & Tabela de Preços */}
        <div className="lg:col-span-7 space-y-12">
          
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              Anuncie no Maior Portal de <span className="text-indigo-500">Notícias Financeiras</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
              Exiba sua marca para milhares de investidores, empreendedores e tomadores de decisão todos os dias. Selecione os espaços abaixo e reserve seu espaço em minutos.
            </p>
          </div>

          {/* MOCKUP INTERATIVO DOS CAMPOS */}
          <div className="border border-white/5 bg-zinc-900/40 rounded-3xl p-6 relative space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Monitor size={14} className="text-indigo-500" /> Mapa de Posicionamento de Banners
            </h3>
            
            <div className="space-y-4 text-center">
              {/* Top Banner simulation */}
              <div 
                onClick={() => setSelectedSlot('ad_top')}
                className={`py-6 rounded-xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${selectedSlot === 'ad_top' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
              >
                Banner do Topo (970x250) - R$ 450
              </div>

              <div className="grid grid-cols-12 gap-3 md:gap-4">
                
                {/* Skin Left simulation */}
                <div 
                  onClick={() => setSelectedSlot('ad_skin_left_home')}
                  className={`col-span-2 py-24 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all ${selectedSlot === 'ad_skin_left_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  style={{ writingMode: 'vertical-rl' }}
                >
                  Skin Esquerda (200x600) - R$ 380
                </div>

                {/* News feed column simulation */}
                <div className="col-span-6 space-y-4">
                  <div className="h-24 bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                    Feed de Matérias do Portal
                  </div>
                  
                  {/* Feed Horizontal Ad simulation */}
                  <div 
                    onClick={() => setSelectedSlot('ad_vittacash_horizontal')}
                    className={`py-4 rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all ${selectedSlot === 'ad_vittacash_horizontal' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    Banner de Centro (728x90) - R$ 240
                  </div>

                  <div className="h-24 bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                    Simuladores de Dividendos
                  </div>
                </div>

                {/* Sidebar Ads simulation */}
                <div className="col-span-2 space-y-4">
                  {/* Square sidebar */}
                  <div 
                    onClick={() => setSelectedSlot('ad_sidebar_1')}
                    className={`py-8 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all ${selectedSlot === 'ad_sidebar_1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    Sidebar 1 (300x300) - R$ 280
                  </div>
                  {/* Skyscraper sidebar */}
                  <div 
                    onClick={() => setSelectedSlot('ad_sidebar_2')}
                    className={`py-16 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all ${selectedSlot === 'ad_sidebar_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                    style={{ writingMode: 'vertical-rl' }}
                  >
                    Sidebar 2 (300x600) - R$ 320
                  </div>
                </div>

                {/* Skin Right simulation */}
                <div 
                  onClick={() => setSelectedSlot('ad_skin_right_home')}
                  className={`col-span-2 py-24 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all ${selectedSlot === 'ad_skin_right_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  style={{ writingMode: 'vertical-rl' }}
                >
                  Skin Direita (200x600) - R$ 380
                </div>

              </div>
            </div>
          </div>

          {/* LISTA DE PREÇOS DETALHADA */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Layout size={14} className="text-indigo-500" /> Tabela de Valores & Dimensões
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AD_SLOTS_INFO.map(slot => (
                <div 
                  key={slot.type}
                  onClick={() => setSelectedSlot(slot.type)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${selectedSlot === slot.type ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md' : 'bg-zinc-900/30 border-white/5 hover:border-zinc-800'}`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-black uppercase" style={{ color: selectedSlot === slot.type ? '#8B84FF' : '#fff' }}>{slot.label}</span>
                      <span className="text-[8px] font-bold bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{slot.size}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium leading-relaxed mb-4">{slot.desc}</p>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                    <span className="text-xs font-black text-indigo-400">{slot.price}</span>
                    <span className="text-[8px] font-medium text-zinc-500 uppercase">{slot.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* LADO DIREITO: Formulário de Reserva */}
        <div className="lg:col-span-5">
          <div className="border border-white/5 bg-zinc-900/30 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-6 sticky top-24">
            
            {success ? (
              <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Reserva Solicitada!</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Sua solicitação de anúncio foi enviada com sucesso para nossa moderação. Analisaremos sua imagem e informações e entraremos em contato via WhatsApp/E-mail para formalizar a ativação.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    Fazer Outra Reserva
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReserve} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Solicitar Reserva</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Preencha os dados e anexe a arte do anúncio</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Formato Escolhido</label>
                    <div className="relative">
                      <select 
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-black text-white focus:border-indigo-500 transition-all appearance-none uppercase border-none"
                      >
                        {AD_SLOTS_INFO.map(s => (
                          <option key={s.type} value={s.type} className="bg-zinc-950 text-white">
                            {s.label} ({s.price})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[8px]">▼</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Seu Nome / Nome Comercial *</label>
                    <input 
                      type="text"
                      required
                      placeholder="EX: JOÃO SILVA / EMPRESA LTDA"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-bold text-white focus:border-indigo-500 transition-all placeholder:text-zinc-700 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">WhatsApp / Celular *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="(34) 99999-9999"
                        value={clientPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numbers = val.replace(/\D/g, '').slice(0, 11);
                          let formatted = '';
                          if (numbers.length > 0) {
                            if (numbers.length <= 2) {
                              formatted = `(${numbers}`;
                            } else if (numbers.length <= 6) {
                              formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
                            } else if (numbers.length <= 10) {
                              formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
                            } else {
                              formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
                            }
                          }
                          setClientPhone(formatted);
                        }}
                        className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-bold text-white focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">E-mail para Contato *</label>
                      <input 
                        type="email"
                        required
                        placeholder="contato@empresa.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-bold text-white focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Imagem do Banner (URL ou Upload) *</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        required
                        placeholder="Cole a URL ou faça upload..."
                        value={adImageUrl}
                        onChange={(e) => setAdImageUrl(e.target.value)}
                        className="flex-1 bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-bold text-white focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                      />
                      <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? (
                          'Carregando...'
                        ) : (
                          <>
                            <Upload size={14} /> Upload
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 block leading-relaxed">
                      Selecione um arquivo de imagem. O sistema fará o recorte e ajuste automático para a dimensão correta.
                    </span>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">URL de Destino do Banner (Opcional)</label>
                    <input 
                      type="url"
                      placeholder="https://sua-empresa.com"
                      value={adTargetUrl}
                      onChange={(e) => setAdTargetUrl(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-bold text-white focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Período de Exibição</label>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {['30', '60', '90'].map(days => (
                        <div 
                          key={days}
                          onClick={() => setDurationDays(days)}
                          className={`py-2 border rounded-lg cursor-pointer text-xs font-black transition-all ${durationDays === days ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-950/40 border-white/5 text-zinc-500'}`}
                        >
                          {days} Dias
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} /> Solicitar Reserva de Banner
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </main>

    </div>
  );
}
