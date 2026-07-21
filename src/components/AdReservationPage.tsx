import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Megaphone, Send, Landmark, Calendar, MessageSquare, 
  HelpCircle, Monitor, Layout, AlertCircle, CheckCircle2, Upload
} from 'lucide-react';
import { supabase } from '../supabase';

const AD_SLOTS_INFO = [
  { 
    type: 'ad_top', 
    label: 'Banner do Topo', 
    size: '970x250 px', 
    price: 'R$ 450,00', 
    period: 'por 30 dias',
    desc: 'Visibilidade mÃ¡xima no topo de todas as pÃ¡ginas do portal.' 
  },
  { 
    type: 'ad_skin_left_home', 
    label: 'Lateral Esquerda - Home (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops na home. Acompanha o scroll do leitor Ã  esquerda.' 
  },
  { 
    type: 'ad_skin_right_home', 
    label: 'Lateral Direita - Home (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops na home. Acompanha o scroll do leitor Ã  direita.' 
  },
  { 
    type: 'ad_skin_left', 
    label: 'Lateral Esquerda - Internas (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops nas pÃ¡ginas internas. Scroll Ã  esquerda.' 
  },
  { 
    type: 'ad_skin_right', 
    label: 'Lateral Direita - Internas (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops nas pÃ¡ginas internas. Scroll Ã  direita.' 
  },
  { 
    type: 'ad_sidebar_1', 
    label: 'Sidebar Quadrado', 
    size: '300x300 px', 
    price: 'R$ 280,00', 
    period: 'por 30 dias',
    desc: 'Posicionado no inÃ­cio do painel lateral ao lado das notÃ­cias mais lidas.' 
  },
  { 
    type: 'ad_sidebar_2', 
    label: 'Sidebar Vertical', 
    size: '300x600 px', 
    price: 'R$ 320,00', 
    period: 'por 30 dias',
    desc: 'Skyscraper vertical posicionado na lateral das pÃ¡ginas de leitura.' 
  },
  { 
    type: 'ad_vittacash_horizontal', 
    label: 'Banner do Feed (Centro)', 
    size: '728x90 px', 
    price: 'R$ 240,00', 
    period: 'por 30 dias',
    desc: 'Banner de destaque inserido dinamicamente no meio do fluxo de notÃ­cias.' 
  }
];

export default function AdReservationPage() {
  const navigate = useNavigate();
  
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string; type: 'info' | 'success' | 'error' } | null>(null);
  
  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setCustomAlert({ title, message, type });
  };
  const [adSlotsInfo, setAdSlotsInfo] = useState(AD_SLOTS_INFO);
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
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activePage, setActivePage] = useState<'home' | 'internas'>('home');
  // Estados para gerenciar slides de Skin Carrossel na reserva publica
  const [adSlides, setAdSlides] = useState<{ id: string; image_url: string; external_url: string; client_name: string; client_phone: string }[]>(
    Array.from({ length: 6 }, (_, i) => ({ id: `slide_${i}`, image_url: '', external_url: '', client_name: '', client_phone: '' }))
  );
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cotas mÃ¡ximas por slot (skins suportam atÃ© 6 anunciantes em carrossel)
  const SLOT_MAX_COTAS: Record<string, number> = {
    'ad_top': 1, 'ad_vittacash_horizontal': 1,
    'ad_skin_left_home': 6, 'ad_skin_right_home': 6,
    'ad_skin_left': 6, 'ad_skin_right': 6,
    'ad_sidebar_1': 1, 'ad_sidebar_2': 1,
    'ad_internal_inline_1': 1, 'ad_internal_inline_2': 1, 'ad_internal_inline_3': 1,
  };

  // Estado de ocupaÃ§Ã£o dos slots (active + pending requests)
  const [occupiedSlots, setOccupiedSlots] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchOccupation = async () => {
      const allTypes = Object.keys(SLOT_MAX_COTAS);
      const pendingTypes = allTypes.map(t => `request_${t}`);

      // Busca slots ativos
      const { data: activeData } = await supabase
        .from('site_content')
        .select('content_type, meta_value')
        .in('content_type', allTypes)
        .eq('is_active', true);

      // Busca solicitaÃ§Ãµes pendentes
      const { data: pendingData } = await supabase
        .from('site_content')
        .select('content_type, meta_value')
        .in('content_type', pendingTypes)
        .eq('is_active', false);

      const counts: Record<string, number> = {};

      // Conta slots ativos (skins contam pelos slides preenchidos)
      (activeData || []).forEach((item: any) => {
        const t = item.content_type;
        if (t.includes('skin')) {
          const slidesCount = (item.meta_value?.slides || []).filter((s: any) => s.image_url).length;
          counts[t] = (counts[t] || 0) + Math.max(1, slidesCount);
        } else {
          counts[t] = (counts[t] || 0) + 1;
        }
      });

      // Soma solicitaÃ§Ãµes pendentes (cada uma Ã© ao menos 1 cota)
      (pendingData || []).forEach((item: any) => {
        const t = item.content_type.replace('request_', '');
        const slidesCount = t.includes('skin')
          ? ((item.meta_value?.slides || []).filter((s: any) => s.image_url).length || 1)
          : 1;
        counts[t] = (counts[t] || 0) + slidesCount;
      });

      setOccupiedSlots(counts);

      // Busca preços dinâmicos
      const { data: priceData } = await supabase
        .from('site_content')
        .select('content_type, image_url, description')
        .like('content_type', 'ad_slot_price_%');

      if (priceData && priceData.length > 0) {
        setAdSlotsInfo(prev => {
          return prev.map(slot => {
            const match = priceData.find(p => p.content_type === `ad_slot_price_${slot.type}`);
            if (match) {
              return {
                ...slot,
                price: match.image_url || slot.price,
                desc: match.description || slot.desc
              };
            }
            return slot;
          });
        });
      }
    };

    fetchOccupation();
  }, []);

  // Helper: retorna { used, max, free, isFull } para um slot
  const getSlotStatus = (type: string) => {
    const max = SLOT_MAX_COTAS[type] ?? 1;
    const used = occupiedSlots[type] ?? 0;
    const free = Math.max(0, max - used);
    return { used, max, free, isFull: free === 0 };
  };

  // Helper: badge de disponibilidade para usar nos slots do mapa
  const SlotBadge = ({ type }: { type: string }) => {
    const { free, max, isFull } = getSlotStatus(type);
    if (isFull) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[7px] font-black uppercase tracking-widest shadow">
          🔴 Esgotado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[7px] font-black uppercase tracking-widest shadow">
        🟢 {free}/{max} {max > 1 ? 'slides' : 'vaga'}
      </span>
    );
  };

  // ConteÃºdo padrÃ£o para slot vazio no mapa
  const SlotEmptyContent = ({ type }: { type: string }) => {
    const { isFull } = getSlotStatus(type);
    return (
      <div className="flex flex-col items-center gap-2">
        {isFull ? (
          <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Sem Vagas</span>
        ) : (
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Anuncie Aqui</span>
        )}
        <SlotBadge type={type} />
      </div>
    );
  };

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
          }, 'image/jpeg', 0.60);
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
    
    // 1. Gera feedback visual imediato
    const instantReader = new FileReader();
    instantReader.onloadend = () => {
      if (instantReader.result) {
        setAdImageUrl(instantReader.result as string);
      }
    };
    instantReader.readAsDataURL(file);

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
        try {
          const imgDimensions = await new Promise<{ w: number, h: number }>((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ w: img.width, h: img.height });
            img.onerror = () => resolve({ w: 0, h: 0 });
            img.src = URL.createObjectURL(file);
          });

          // Se for diferente das dimensÃµes do slot, faz o recorte via Canvas
          if (imgDimensions.w > 0 && (imgDimensions.w !== targetDimensions.w || imgDimensions.h !== targetDimensions.h)) {
            showAlert("Ajustando Imagem", `DimensÃµes: ${imgDimensions.w}x${imgDimensions.h}. O tamanho ideal para este espaÃ§o Ã© ${targetDimensions.w}x${targetDimensions.h}. Faremos o ajuste e recorte automÃ¡tico.`, "info");
            finalFile = await cropAndResizeImage(file, targetDimensions.w, targetDimensions.h);
          }
        } catch (canvasErr) {
          console.warn("Canvas crop failed, falling back to original file:", canvasErr);
          finalFile = file; // Fallback para a imagem original
        }
      }

      // Convertemos o arquivo final (redimensionado ou original) para Base64 local definitivo
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setAdImageUrl(base64data);
        if (selectedSlot.includes('skin')) {
          setAdSlides(prev => {
            const updated = [...prev];
            if (updated[activeSlideIdx]) {
              updated[activeSlideIdx].image_url = base64data;
            }
            return updated;
          });
        }
        showAlert("Imagem Carregada", "Seu banner foi processado e anexado com sucesso!", "success");
      };
      reader.readAsDataURL(finalFile);

    } catch (err: any) {
      console.error(err);
      showAlert("Erro no Processamento", err.message || "NÃ£o foi possÃ­vel carregar a imagem.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !adImageUrl) {
      setErrorMsg('Por favor, preencha todos os campos obrigatÃ³rios.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    const selectedInfo = adSlotsInfo.find(s => s.type === selectedSlot);
    let finalImageUrl = adImageUrl;
    let finalSlides: any[] = [];

    // Se for carrossel, atualiza o slide ativo com os dados finais inseridos pelo usuario
    if (selectedSlot.includes('skin')) {
      const updatedSlides = [...adSlides];
      updatedSlides[activeSlideIdx] = {
        id: updatedSlides[activeSlideIdx]?.id || `slide_${activeSlideIdx}`,
        image_url: adImageUrl,
        external_url: adTargetUrl || '#',
        client_name: clientName,
        client_phone: clientPhone
      };

      const validSlides = updatedSlides.filter(s => s.image_url && s.image_url.trim() !== '');
      finalSlides = validSlides;
      
      if (validSlides.length > 0) {
        finalImageUrl = validSlides[0].image_url;
      }
    }

    const leadText = `OlÃ¡! Gostaria de solicitar a reserva de um banner de publicidade no portal A2 NotÃ­cias.%0A%0A*Nome:* ${clientName}%0A*WhatsApp:* ${clientPhone}%0A*E-mail:* ${clientEmail}%0A*Formato:* ${selectedInfo?.label || selectedSlot}%0A*PerÃ­odo:* ${durationDays} dias%0A*Valor Cotado:* ${selectedInfo?.price || 'Sob Consulta'}%0A*Destino do Banner:* ${adTargetUrl || 'NÃ£o informado'}%0A*Link do Banner:* ${finalImageUrl.startsWith('data:') ? 'Enviado em anexo' : finalImageUrl}`;

    try {
      const { error } = await supabase.from('site_content').insert({
        content_type: `request_${selectedSlot}`,
        title: `${selectedInfo?.label || 'Reserva'} - ${clientName}`,
        image_url: finalImageUrl,
        description: `DuraÃ§Ã£o: ${durationDays} dias. Solicitante: ${clientName} (${clientEmail} | ${clientPhone})`,
        is_active: false,
        meta_value: {
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          duration_days: durationDays,
          external_url: adTargetUrl,
          slot_type: selectedSlot,
          price_quoted: selectedInfo?.price || 'Sob Consulta',
          requested_at: new Date().toISOString(),
          base64_backup: finalImageUrl.startsWith('data:') ? finalImageUrl : undefined,
          slides: finalSlides.length > 0 ? finalSlides : undefined
        }
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=5534998408962&text=${leadText}`, '_blank');
      }, 500);
    } catch (err: any) {
      console.warn("Database insert block active, opening direct WhatsApp contact...", err);
      setSuccess(true);
      setTimeout(() => {
        window.open(`https://api.whatsapp.com/send?phone=5534998408962&text=${leadText}`, '_blank');
      }, 500);
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
          A2mentor <span className="text-indigo-500">Publicidades</span>
        </span>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-16 flex flex-col gap-12">
        
        {/* LADO ESQUERDO: Posicionamento dos Campos & Tabela de PreÃ§os */}
        <div className="w-full space-y-12">
          
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
              Anuncie no Maior Portal de <span className="text-indigo-500">Notícias</span>
            </h1>
            <p className="text-zinc-400 text-sm font-semibold leading-relaxed max-w-2xl mb-8">
              Exiba sua marca para milhares de investidores, empreendedores e tomadores de decisão todos os dias. Selecione os espaços abaixo e reserve seu espaço em minutos.
            </p>
          </div>

          {/* SELETOR DE PÁGINAS DO MAPA */}
          <div className="flex gap-2 p-1 bg-zinc-900/80 border border-white/5 rounded-2xl max-w-sm mb-6">
            <button
              type="button"
              onClick={() => { setActivePage('home'); setSelectedSlot('ad_top'); setAdImageUrl(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activePage === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              🖥️ Página Inicial
            </button>
            <button
              type="button"
              onClick={() => { setActivePage('internas'); setSelectedSlot('ad_skin_left'); setAdImageUrl(''); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activePage === 'internas' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              📄 Página Interna
            </button>
          </div>

          {/* MOCKUP INTERATIVO DOS CAMPOS */}
          <div className="border border-white/5 bg-zinc-900/40 rounded-3xl p-6 relative space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Monitor size={14} className="text-indigo-500" />
              {activePage === 'home' ? 'Mapa de Posicionamento - Página Inicial (Home)' : 'Mapa de Posicionamento - Páginas Internas (Matérias)'}
            </h3>
            
            <div className="space-y-4 text-center">
              {activePage === 'home' ? (
                /* LAYOUT PÁGINA 1: HOME REALISTA */
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full relative">
                  
                  {/* Skin Esquerda (Lateral Extrema Esquerda) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_left_home'); setIsFormOpen(true); }}
                    className={`w-28 shrink-0 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 self-stretch min-h-[400px] relative overflow-hidden ${
                      getSlotStatus('ad_skin_left_home').isFull
                        ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                        : selectedSlot === 'ad_skin_left_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {selectedSlot === 'ad_skin_left_home' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Left" />
                    ) : (
                      <SlotEmptyContent type="ad_skin_left_home" />
                    )}
                  </div>

                  {/* Bloco Central - Simulação do Site */}
                  <div className="flex-1 max-w-2xl bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                    
                    {/* Banner do Topo */}
                    <div 
                      onClick={() => { setSelectedSlot('ad_top'); setIsFormOpen(true); }}
                      className={`rounded-xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[80px] flex flex-col items-center justify-center gap-1.5 relative overflow-hidden ${
                        getSlotStatus('ad_top').isFull
                          ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                          : selectedSlot === 'ad_top' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {selectedSlot === 'ad_top' && adImageUrl ? (
                        <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Topo" />
                      ) : (
                        <SlotEmptyContent type="ad_top" />
                      )}
                    </div>

                    {/* Grid interna: Feed de Matérias e Sidebars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Feed de Matérias */}
                      <div className="md:col-span-2 space-y-4 flex flex-col justify-stretch">
                        <div className="h-28 bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                          Feed de Matérias do Portal
                        </div>
                        
                        {/* Banner do Centro */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_vittacash_horizontal'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[50px] flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                            getSlotStatus('ad_vittacash_horizontal').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_vittacash_horizontal' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_vittacash_horizontal' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Centro" />
                          ) : (
                            <SlotEmptyContent type="ad_vittacash_horizontal" />
                          )}
                        </div>

                        <div className="h-24 bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                          Simuladores de Dividendos
                        </div>
                      </div>

                      {/* Column Sidebar Ads */}
                      <div className="md:col-span-1 flex flex-col gap-4">
                        {/* Sidebar 1 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_1'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all min-h-[90px] text-center gap-1 relative overflow-hidden ${
                            getSlotStatus('ad_sidebar_1').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_sidebar_1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_sidebar_1' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 1" />
                          ) : (
                            <SlotEmptyContent type="ad_sidebar_1" />
                          )}
                        </div>
                        
                        {/* Sidebar 2 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 relative overflow-hidden min-h-[160px] ${
                            getSlotStatus('ad_sidebar_2').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_sidebar_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_sidebar_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 2" />
                          ) : (
                            <SlotEmptyContent type="ad_sidebar_2" />
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Skin Direita (Lateral Extrema Direita) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_right_home'); setIsFormOpen(true); }}
                    className={`w-28 shrink-0 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 self-stretch min-h-[400px] relative overflow-hidden ${
                      getSlotStatus('ad_skin_right_home').isFull
                        ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                        : selectedSlot === 'ad_skin_right_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {selectedSlot === 'ad_skin_right_home' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Right" />
                    ) : (
                      <SlotEmptyContent type="ad_skin_right_home" />
                    )}
                  </div>

                </div>
              ) : (
                /* LAYOUT PÁGINA 2: PÁGINAS INTERNAS REALISTA */
                <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 w-full relative">
                  
                  {/* Skin Esquerda Internas (Lateral Extrema Esquerda) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_left'); setIsFormOpen(true); }}
                    className={`w-28 shrink-0 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 self-stretch min-h-[400px] relative overflow-hidden ${
                      getSlotStatus('ad_skin_left').isFull
                        ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                        : selectedSlot === 'ad_skin_left' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {selectedSlot === 'ad_skin_left' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Left" />
                    ) : (
                      <SlotEmptyContent type="ad_skin_left" />
                    )}
                  </div>

                  {/* Bloco Central - Simulação do Site */}
                  <div className="flex-1 max-w-2xl bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Conteúdo da Notícia & Anúncios Internos */}
                      <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                        <div className="p-4 bg-zinc-800/10 border border-white/5 rounded-xl text-left space-y-2">
                          <div className="h-4 w-1/3 bg-indigo-500/20 rounded-full" />
                          <div className="h-6 w-full bg-zinc-800/30 rounded-xl" />
                          <div className="h-3 w-5/6 bg-zinc-800/20 rounded-full" />
                        </div>

                        {/* Anúncio Interno 01 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_1'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[50px] flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                            getSlotStatus('ad_internal_inline_1').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_internal_inline_1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_internal_inline_1' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 1" />
                          ) : (
                            <SlotEmptyContent type="ad_internal_inline_1" />
                          )}
                        </div>

                        <div className="p-4 bg-zinc-800/10 border border-white/5 rounded-xl text-left space-y-2">
                          <div className="h-3 w-full bg-zinc-800/20 rounded-full" />
                          <div className="h-3 w-4/5 bg-zinc-800/20 rounded-full" />
                        </div>

                        {/* Anúncio Interno 02 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[50px] flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                            getSlotStatus('ad_internal_inline_2').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_internal_inline_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_internal_inline_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 2" />
                          ) : (
                            <SlotEmptyContent type="ad_internal_inline_2" />
                          )}
                        </div>

                        {/* Anúncio Interno 03 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_3'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[50px] flex flex-col items-center justify-center gap-1 relative overflow-hidden ${
                            getSlotStatus('ad_internal_inline_3').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_internal_inline_3' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_internal_inline_3' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 3" />
                          ) : (
                            <SlotEmptyContent type="ad_internal_inline_3" />
                          )}
                        </div>
                      </div>

                      {/* Sidebar 2 - Internas */}
                      <div className="md:col-span-1 flex flex-col justify-stretch">
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 relative overflow-hidden flex-1 min-h-[300px] ${
                            getSlotStatus('ad_sidebar_2').isFull
                              ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                              : selectedSlot === 'ad_sidebar_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {selectedSlot === 'ad_sidebar_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 2" />
                          ) : (
                            <SlotEmptyContent type="ad_sidebar_2" />
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Skin Direita Internas (Lateral Extrema Direita) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_right'); setIsFormOpen(true); }}
                    className={`w-28 shrink-0 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 self-stretch min-h-[400px] relative overflow-hidden ${
                      getSlotStatus('ad_skin_right').isFull
                        ? 'bg-rose-900/20 border-rose-700/40 text-rose-500 cursor-not-allowed'
                        : selectedSlot === 'ad_skin_right' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'
                    }`}
                  >
                    {selectedSlot === 'ad_skin_right' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Right" />
                    ) : (
                      <SlotEmptyContent type="ad_skin_right" />
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* LISTA DE PREÃ‡OS DETALHADA */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Layout size={14} className="text-indigo-500" /> Tabela de Valores & DimensÃµes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adSlotsInfo.map(slot => (
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

        {/* MODAL POPUP PARA SOLICITAÃ‡ÃƒO DE RESERVA */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
              
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-rose-500 font-black uppercase text-[10px] tracking-widest bg-zinc-800/40 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
              >
                Fechar [X]
              </button>
            
            {success ? (
              <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Reserva Solicitada!</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Sua solicitaÃ§Ã£o de anÃºncio foi enviada com sucesso para nossa moderaÃ§Ã£o. Analisaremos sua imagem e informaÃ§Ãµes e entraremos em contato via WhatsApp/E-mail para formalizar a ativaÃ§Ã£o.
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
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Preencha os dados e anexe a arte do anÃºncio</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle size={14} /> {errorMsg}
                  </div>
                )}

                {/* Slots disponÃ­veis por pÃ¡gina */}
                {(() => {
                  // Slots exclusivos de cada pÃ¡gina
                  const HOME_SLOTS = ['ad_top', 'ad_vittacash_horizontal', 'ad_skin_left_home', 'ad_skin_right_home', 'ad_sidebar_1', 'ad_sidebar_2'];
                  const INTERNAL_SLOTS = ['ad_skin_left', 'ad_skin_right', 'ad_sidebar_2', 'ad_internal_inline_1', 'ad_internal_inline_2', 'ad_internal_inline_3'];
                  const allowedSlots = activePage === 'home' ? HOME_SLOTS : INTERNAL_SLOTS;
                  const filteredSlots = adSlotsInfo.filter(s => allowedSlots.includes(s.type));
                  return (
                <div className="space-y-4">
                  {/* Indicador da pÃ¡gina selecionada no formulÃ¡rio */}
                  <div className={`px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                    activePage === 'home'
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    {activePage === 'home' ? 'ðŸ–¥ï¸ Reservando slot na PÃ¡gina Inicial (Home)' : 'ðŸ“„ Reservando slot nas PÃ¡ginas Internas (MatÃ©rias)'}
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Formato Escolhido</label>
                    <div className="relative">
                      <select 
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl outline-none text-xs font-black text-white focus:border-indigo-500 transition-all appearance-none uppercase border-none"
                      >
                        {filteredSlots.map(s => (
                          <option key={s.type} value={s.type} className="bg-zinc-950 text-white">
                            {s.label} ({s.price})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[8px]">â–¼</div>
                    </div>
                  </div>

                  {/* SELETOR DE SLIDES PARA SKINS (CARROSSEL) NO PORTAL DE RESERVAS PÃšBLICO */}
                  {selectedSlot.includes('skin') && (
                    <div className="mb-4">
                      <label className="text-[9px] font-black uppercase text-zinc-500 mb-2 block tracking-widest ml-1">
                        Carrossel de Slides â€” AtÃ© 6 Imagens ({adSlides.filter(s => s.image_url && s.image_url.trim() !== '').length} adicionada(s))
                      </label>
                      <div className="grid grid-cols-6 gap-1 bg-zinc-950/60 p-1 border border-white/5 rounded-xl">
                        {[0, 1, 2, 3, 4, 5].map(idx => {
                          const hasImg = !!(adSlides[idx]?.image_url);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                // Salva o estado atual no slide anterior antes de trocar
                                const updated = [...adSlides];
                                updated[activeSlideIdx] = {
                                  id: updated[activeSlideIdx]?.id || `slide_${activeSlideIdx}`,
                                  image_url: adImageUrl,
                                  external_url: adTargetUrl || '#',
                                  client_name: clientName,
                                  client_phone: clientPhone
                                };
                                setAdSlides(updated);
                                
                                // Muda para o slide selecionado
                                setActiveSlideIdx(idx);
                                setAdImageUrl(updated[idx]?.image_url || '');
                                setAdTargetUrl(updated[idx]?.external_url || '');
                                // MantÃ©m o Nome do Anunciante e WhatsApp do cliente no formulÃ¡rio, a nÃ£o ser que o slide jÃ¡ possua outro anunciante especÃ­fico
                                if (updated[idx]?.client_name) {
                                  setClientName(updated[idx].client_name);
                                }
                                if (updated[idx]?.client_phone) {
                                  setClientPhone(updated[idx].client_phone);
                                }
                              }}
                              className={`py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${activeSlideIdx === idx ? 'bg-indigo-600 text-white shadow-sm' : hasImg ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' : 'bg-transparent text-zinc-600 hover:text-zinc-400'}`}
                            >
                              {idx + 1}
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider text-center mt-1.5">
                        Adicionando Arte para o Slide {activeSlideIdx + 1} â€” {adSlides[activeSlideIdx]?.image_url ? 'âœ… Com imagem' : 'â¬œ Vazio'}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">Seu Nome / Nome Comercial *</label>
                    <input 
                      type="text"
                      required
                      placeholder="EX: JOÃƒO SILVA / EMPRESA LTDA"
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
                        placeholder="Cole a URL ou faÃ§a upload..."
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
                    
                    {/* CARD DE PREVIEW DO BANNER EM MINIATURA */}
                    {adImageUrl && (
                      <div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3 block self-start">PrÃ©-visualizaÃ§Ã£o do Banner</span>
                        <div className="w-full flex items-center justify-center overflow-hidden bg-black/40 rounded-lg border border-white/10 p-2">
                          <img 
                            src={adImageUrl} 
                            alt="Preview do Banner" 
                            className="max-h-48 object-contain rounded transition-all duration-300"
                          />
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase mt-2">
                          ProporÃ§Ã£o do espaÃ§o: {
                            selectedSlot === 'ad_top' ? '970x250 (Horizontal Longo)' :
                            selectedSlot === 'ad_vittacash_horizontal' ? '728x90 (Horizontal)' :
                            selectedSlot === 'ad_skin_left_home' || selectedSlot === 'ad_skin_right_home' ? '300x600 (Skin Vertical)' :
                            selectedSlot === 'ad_sidebar_1' ? '300x300 (Quadrado)' : '300x600 (Vertical Largo)'
                          }
                        </span>
                      </div>
                    )}

                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5 block leading-relaxed">
                      Selecione um arquivo de imagem. O sistema farÃ¡ o recorte e ajuste automÃ¡tico para a dimensÃ£o correta.
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
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 mb-1.5 block text-zinc-500">PerÃ­odo de ExibiÃ§Ã£o</label>
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
                  );
                })()}

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
        )}

        {/* MODAL DE ALERTA VISUAL CUSTOMIZADO E PREMIUM */}
        {customAlert && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-gradient-to-b from-zinc-900 to-black border border-white/10 p-6 md:p-8 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200 text-center space-y-5 relative overflow-hidden">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border ${
                customAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                customAlert.type === 'error' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {customAlert.type === 'success' ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">{customAlert.title}</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-2.5 leading-relaxed">
                  {customAlert.message}
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCustomAlert(null)}
                  className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${
                    customAlert.type === 'success' ? 'bg-emerald-500 text-black shadow-emerald-500/20 hover:bg-emerald-400' :
                    customAlert.type === 'error' ? 'bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-500' :
                    'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-500'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
