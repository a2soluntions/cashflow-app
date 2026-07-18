import React, { useState } from 'react';
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
    desc: 'Visibilidade máxima no topo de todas as páginas do portal.' 
  },
  { 
    type: 'ad_skin_left_home', 
    label: 'Lateral Esquerda - Home (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops na home. Acompanha o scroll do leitor à esquerda.' 
  },
  { 
    type: 'ad_skin_right_home', 
    label: 'Lateral Direita - Home (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops na home. Acompanha o scroll do leitor à direita.' 
  },
  { 
    type: 'ad_skin_left', 
    label: 'Lateral Esquerda - Internas (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops nas páginas internas. Scroll à esquerda.' 
  },
  { 
    type: 'ad_skin_right', 
    label: 'Lateral Direita - Internas (Skin)', 
    size: '300x600 px', 
    price: 'R$ 380,00', 
    period: 'por 30 dias',
    desc: 'Exclusivo para desktops nas páginas internas. Scroll à direita.' 
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
  
  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    alert(`${title.toUpperCase()}\n\n${message}`);
  };
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

          // Se for diferente das dimensões do slot, faz o recorte via Canvas
          if (imgDimensions.w > 0 && (imgDimensions.w !== targetDimensions.w || imgDimensions.h !== targetDimensions.h)) {
            showAlert("Ajustando Imagem", `Dimensões: ${imgDimensions.w}x${imgDimensions.h}. O tamanho ideal para este espaço é ${targetDimensions.w}x${targetDimensions.h}. Faremos o ajuste e recorte automático.`, "info");
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
      showAlert("Erro no Processamento", err.message || "Não foi possível carregar a imagem.", "error");
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

    const selectedInfo = AD_SLOTS_INFO.find(s => s.type === selectedSlot);
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

    const leadText = `Olá! Gostaria de solicitar a reserva de um banner de publicidade no portal A2 Notícias.%0A%0A*Nome:* ${clientName}%0A*WhatsApp:* ${clientPhone}%0A*E-mail:* ${clientEmail}%0A*Formato:* ${selectedInfo?.label || selectedSlot}%0A*Período:* ${durationDays} dias%0A*Valor Cotado:* ${selectedInfo?.price || 'Sob Consulta'}%0A*Destino do Banner:* ${adTargetUrl || 'Não informado'}%0A*Link do Banner:* ${finalImageUrl.startsWith('data:') ? 'Enviado em anexo' : finalImageUrl}`;

    try {
      const { error } = await supabase.from('site_content').insert({
        content_type: `request_${selectedSlot}`,
        title: `${selectedInfo?.label || 'Reserva'} - ${clientName}`,
        image_url: finalImageUrl,
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
        
        {/* LADO ESQUERDO: Posicionamento dos Campos & Tabela de Preços */}
        <div className="w-full space-y-12">
          
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
              Anuncie no Maior Portal de <span className="text-indigo-500">Notícias</span>
            </h1>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xl">
              Exiba sua marca para milhares de investidores, empreendedores e tomadores de decisão todos os dias. Selecione os espaços abaixo e reserve seu espaço em minutos.
            </p>
          </div>

          {/* SELETOR DE PÁGINAS DO MAPA */}
          <div className="flex gap-2 p-1 bg-zinc-900/80 border border-white/5 rounded-2xl max-w-sm mb-4">
            <button
              type="button"
              onClick={() => setActivePage('home')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activePage === 'home' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              🖥️ Página 1: Página Inicial
            </button>
            <button
              type="button"
              onClick={() => setActivePage('internas')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activePage === 'internas' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            >
              📄 Página 2: Páginas Internas
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
                /* LAYOUT PÁGINA 1: HOME (IMAGEM 2) */
                <div className="grid grid-cols-14 gap-4 items-stretch">
                  
                  {/* Skin Esquerda (Lateral Extrema) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_left_home'); setIsFormOpen(true); }}
                    className={`col-span-3 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 min-h-[500px] relative overflow-hidden ${selectedSlot === 'ad_skin_left_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    {selectedSlot === 'ad_skin_left_home' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Left" />
                    ) : (
                      <>
                        <span>Skin Esquerda</span>
                        <span>(300x600)</span>
                        <span>R$ 380</span>
                      </>
                    )}
                  </div>

                  {/* Bloco Central (Contém Banner Topo, Feed e Banner Centro) */}
                  <div className="col-span-8 flex flex-col gap-4">
                    {/* Banner do Topo */}
                    <div 
                      onClick={() => { setSelectedSlot('ad_top'); setIsFormOpen(true); }}
                      className={`rounded-xl border text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[100px] flex items-center justify-center relative overflow-hidden ${selectedSlot === 'ad_top' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                    >
                      {selectedSlot === 'ad_top' && adImageUrl ? (
                        <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Topo" />
                      ) : (
                        <span>Banner do Topo (970x250) - R$ 450</span>
                      )}
                    </div>

                    {/* Grid interna: Feed de Matérias e Sidebars */}
                    <div className="grid grid-cols-8 gap-4 flex-1">
                      
                      {/* Feed de Matérias */}
                      <div className="col-span-6 space-y-4 flex flex-col justify-stretch">
                        <div className="flex-1 min-h-[140px] bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                          Feed de Matérias do Portal
                        </div>
                        
                        {/* Banner do Centro */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_vittacash_horizontal'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[60px] flex items-center justify-center relative overflow-hidden ${selectedSlot === 'ad_vittacash_horizontal' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_vittacash_horizontal' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Centro" />
                          ) : (
                            <span>Banner de Centro (728x90) - R$ 240</span>
                          )}
                        </div>

                        <div className="min-h-[120px] bg-zinc-800/10 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                          Simuladores de Dividendos
                        </div>
                      </div>

                      {/* Column Sidebar Ads */}
                      <div className="col-span-2 flex flex-col gap-4">
                        {/* Sidebar 1 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_1'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center justify-center cursor-pointer transition-all min-h-[100px] text-center relative overflow-hidden ${selectedSlot === 'ad_sidebar_1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_sidebar_1' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 1" />
                          ) : (
                            <span>Sidebar 1 (300x300) - R$ 280</span>
                          )}
                        </div>
                        
                        {/* Sidebar 2 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center relative overflow-hidden flex-1 min-h-[200px] justify-center ${selectedSlot === 'ad_sidebar_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_sidebar_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 2" />
                          ) : (
                            <>
                              <span>Sidebar 2</span>
                              <span>(300x600)</span>
                              <span>R$ 320</span>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Skin Direita (Lateral Extrema) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_right_home'); setIsFormOpen(true); }}
                    className={`col-span-3 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 min-h-[500px] relative overflow-hidden ${selectedSlot === 'ad_skin_right_home' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    {selectedSlot === 'ad_skin_right_home' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Right" />
                    ) : (
                      <>
                        <span>Skin Direita</span>
                        <span>(300x600)</span>
                        <span>R$ 380</span>
                      </>
                    )}
                  </div>

                </div>
              ) : (
                /* LAYOUT PÁGINA 2: PÁGINAS INTERNAS (MATÉRIAS) */
                <div className="grid grid-cols-14 gap-4 items-stretch">
                  
                  {/* Skin Esquerda (Lateral Extrema) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_left'); setIsFormOpen(true); }}
                    className={`col-span-3 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 min-h-[500px] relative overflow-hidden ${selectedSlot === 'ad_skin_left' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    {selectedSlot === 'ad_skin_left' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Left" />
                    ) : (
                      <>
                        <span>Skin Esquerda</span>
                        <span>(300x600)</span>
                        <span>R$ 380</span>
                      </>
                    )}
                  </div>

                  {/* Área Central: Título, Conteúdo da Notícia, Banners Internos e Sidebar */}
                  <div className="col-span-8 flex flex-col gap-4">
                    <div className="grid grid-cols-8 gap-4 flex-1">
                      
                      {/* Conteúdo da Notícia & Anúncios Internos */}
                      <div className="col-span-6 space-y-4 flex flex-col justify-between">
                        <div className="p-4 bg-zinc-800/10 border border-white/5 rounded-xl text-left space-y-2">
                          <div className="h-4 w-1/3 bg-indigo-500/20 rounded-full" />
                          <div className="h-6 w-full bg-zinc-800/30 rounded-xl" />
                          <div className="h-3 w-5/6 bg-zinc-800/20 rounded-full" />
                        </div>

                        {/* Anúncio Interno 01 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_1'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[60px] flex items-center justify-center relative overflow-hidden ${selectedSlot === 'ad_internal_inline_1' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_internal_inline_1' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 1" />
                          ) : (
                            <span>Anúncio Interno 01 (728x90) - R$ 150</span>
                          )}
                        </div>

                        <div className="p-4 bg-zinc-800/10 border border-white/5 rounded-xl text-left space-y-2">
                          <div className="h-3 w-full bg-zinc-800/20 rounded-full" />
                          <div className="h-3 w-4/5 bg-zinc-800/20 rounded-full" />
                        </div>

                        {/* Anúncio Interno 02 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[60px] flex items-center justify-center relative overflow-hidden ${selectedSlot === 'ad_internal_inline_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_internal_inline_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 2" />
                          ) : (
                            <span>Anúncio Interno 02 (728x90) - R$ 150</span>
                          )}
                        </div>

                        {/* Anúncio Interno 03 */}
                        <div 
                          onClick={() => { setSelectedSlot('ad_internal_inline_3'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all min-h-[60px] flex items-center justify-center relative overflow-hidden ${selectedSlot === 'ad_internal_inline_3' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_internal_inline_3' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Interno 3" />
                          ) : (
                            <span>Anúncio Interno 03 (728x90) - R$ 150</span>
                          )}
                        </div>
                      </div>

                      {/* Sidebar 2 */}
                      <div className="col-span-2 flex flex-col justify-stretch">
                        <div 
                          onClick={() => { setSelectedSlot('ad_sidebar_2'); setIsFormOpen(true); }}
                          className={`rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center relative overflow-hidden flex-1 min-h-[300px] justify-center ${selectedSlot === 'ad_sidebar_2' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                        >
                          {selectedSlot === 'ad_sidebar_2' && adImageUrl ? (
                            <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Sidebar 2" />
                          ) : (
                            <>
                              <span>Sidebar 2</span>
                              <span>(300x600)</span>
                              <span>R$ 320</span>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Skin Direita (Lateral Extrema) */}
                  <div 
                    onClick={() => { setSelectedSlot('ad_skin_right'); setIsFormOpen(true); }}
                    className={`col-span-3 rounded-xl border text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1 min-h-[500px] relative overflow-hidden ${selectedSlot === 'ad_skin_right' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 shadow-lg' : 'bg-zinc-800/20 border-white/5 hover:border-zinc-700 text-zinc-500'}`}
                  >
                    {selectedSlot === 'ad_skin_right' && adImageUrl ? (
                      <img src={adImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Preview Skin Right" />
                    ) : (
                      <>
                        <span>Skin Direita</span>
                        <span>(300x600)</span>
                        <span>R$ 380</span>
                      </>
                    )}
                  </div>

                </div>
              )}
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

        {/* MODAL POPUP PARA SOLICITAÇÃO DE RESERVA */}
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

                  {/* SELETOR DE SLIDES PARA SKINS (CARROSSEL) NO PORTAL DE RESERVAS PÚBLICO */}
                  {selectedSlot.includes('skin') && (
                    <div className="mb-4">
                      <label className="text-[9px] font-black uppercase text-zinc-500 mb-2 block tracking-widest ml-1">
                        Carrossel de Slides — Até 6 Imagens ({adSlides.filter(s => s.image_url && s.image_url.trim() !== '').length} adicionada(s))
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
                                // Mantém o Nome do Anunciante e WhatsApp do cliente no formulário, a não ser que o slide já possua outro anunciante específico
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
                        Adicionando Arte para o Slide {activeSlideIdx + 1} — {adSlides[activeSlideIdx]?.image_url ? '✅ Com imagem' : '⬜ Vazio'}
                      </div>
                    </div>
                  )}

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
                    
                    {/* CARD DE PREVIEW DO BANNER EM MINIATURA */}
                    {adImageUrl && (
                      <div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest mb-3 block self-start">Pré-visualização do Banner</span>
                        <div className="w-full flex items-center justify-center overflow-hidden bg-black/40 rounded-lg border border-white/10 p-2">
                          <img 
                            src={adImageUrl} 
                            alt="Preview do Banner" 
                            className="max-h-48 object-contain rounded transition-all duration-300"
                          />
                        </div>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase mt-2">
                          Proporção do espaço: {
                            selectedSlot === 'ad_top' ? '970x250 (Horizontal Longo)' :
                            selectedSlot === 'ad_vittacash_horizontal' ? '728x90 (Horizontal)' :
                            selectedSlot === 'ad_skin_left_home' || selectedSlot === 'ad_skin_right_home' ? '300x600 (Skin Vertical)' :
                            selectedSlot === 'ad_sidebar_1' ? '300x300 (Quadrado)' : '300x600 (Vertical Largo)'
                          }
                        </span>
                      </div>
                    )}

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
        )}

      </main>

    </div>
  );
}
