import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  User, Building2, Lock, Save, Mail, ShieldCheck, Camera, 
  Laptop, Cloud, CheckCircle2, AlertTriangle, Database, Smartphone} from 'lucide-react';

// Verifica se está no modo Desktop
const isDesktop = !!(window as any).electronAPI;

interface ProfileSettingsProps {
  session: any;
  onUpdate?: () => void; // Função para avisar o App que o perfil mudou (atualizar cabeçalho)
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ session, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Dados do Formulário
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- 1. CARREGAR DADOS (HÍBRIDO) ---
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { user } = session;

        if (isDesktop) {
          // MODO DESKTOP: Busca do Banco Local (SQLite)
          const profiles = await (window as any).electronAPI.getAll('profiles');
          if (profiles && profiles.length > 0) {
            const data = profiles[0]; // Pega o primeiro usuário encontrado
            setFullName(data.full_name || '');
            setCompanyName(data.company_name || '');
            setRole(data.role || '');
            setAvatarUrl(data.avatar_url || null);
          }
        } else {
          // MODO WEB: Busca do Supabase
          let { data, error, status } = await supabase
            .from('profiles')
            .select('full_name, company_name, role, avatar_url')
            .eq('id', user.id)
            .single();

          if (error && status !== 406) {
            throw error;
          }

          if (data) {
            setFullName(data.full_name || '');
            setCompanyName(data.company_name || '');
            setRole(data.role || '');
            setAvatarUrl(data.avatar_url || null);
          }
        }
      } catch (error) {
        console.log('Erro ao carregar perfil', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  // --- 2. UPLOAD DE FOTO (HÍBRIDO) ---
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];

      if (isDesktop) {
        // MODO DESKTOP: Converte a imagem para Base64 (Texto) e salva localmente
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAvatarUrl(base64String); // Mostra na hora para o usuário ver
          setMessage({ text: 'Foto selecionada! Clique em Salvar para confirmar.', type: 'success' });
        };
        reader.readAsDataURL(file);
      } else {
        // MODO WEB: Upload para o Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        let { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Pegar a URL pública
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        
        // Atualizar estado local para preview
        setAvatarUrl(data.publicUrl);
        setMessage({ text: 'Foto carregada! Clique em Salvar para confirmar.', type: 'success' });
      }

    } catch (error) {
      setMessage({ text: 'Erro ao fazer upload da imagem.', type: 'error' });
      console.log(error);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- 3. SALVAR DADOS (HÍBRIDO) ---
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        full_name: fullName,
        company_name: companyName,
        role: role,
        avatar_url: avatarUrl,
        // updated_at: new Date(),
      };

      if (isDesktop) {
        // MODO DESKTOP: Salva no SQLite
        // Usamos o ID fixo 'offline_user' conforme definimos no db.cjs
        await (window as any).electronAPI.update('profiles', 'offline_user', updates);
      } else {
        // MODO WEB: Salva no Supabase
        const updatesWeb = {
            id: user.id,
            ...updates,
            updated_at: new Date(),
        };
        let { error } = await supabase.from('profiles').upsert(updatesWeb);
        if (error) throw error;

        // Alterar senha (apenas Web)
        if (password) {
            const { error: passError } = await supabase.auth.updateUser({ password: password });
            if (passError) throw passError;
            setPassword('');
        }
      }

      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
      
      // AVISAR O APP PARA ATUALIZAR O CABEÇALHO (IMPORTANTE)
      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erro ao atualizar.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar p-1">
      
      {/* HEADER / CARTÃO DE VISITA */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Building2 className="w-32 h-32" />
          </div>
          
          {/* FOTO DO PERFIL */}
          <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-500/20 overflow-hidden border-4 border-white dark:border-zinc-800">
                  {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                      <span>{fullName ? fullName.charAt(0).toUpperCase() : (session.user.email?.charAt(0).toUpperCase() || 'U')}</span>
                  )}
                  
                  {/* Overlay de Loading durante Upload */}
                  {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                  )}
              </div>

              {/* BOTÃO DA CÂMERA (INPUT FILE ESCONDIDO) */}
              <label className="absolute -bottom-1 -right-1 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg border-2 border-white dark:border-zinc-900 cursor-pointer hover:bg-slate-700 transition-colors active:scale-95">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                  />
              </label>
          </div>

          <div className="text-center md:text-left z-10">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{fullName || 'Usuário VittaCash'}</h2>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1">{companyName || 'Sua Empresa'}</p>
              <p className="text-xs text-slate-400">{session?.user?.email}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 lg:pb-0">
          {/* FORMULÁRIO DE DADOS */}
          <form onSubmit={updateProfile} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-zinc-800 h-fit">
              <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-500">
                      <User className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Dados Pessoais</h3>
              </div>

              <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome Completo</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 text-sm font-medium text-slate-700 dark:text-white transition-colors"
                        placeholder="Seu nome"
                      />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nome da Empresa</label>
                          <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 text-sm font-medium text-slate-700 dark:text-white transition-colors"
                            placeholder="A2 Solutions"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Cargo</label>
                          <input 
                            type="text" 
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-emerald-500 text-sm font-medium text-slate-700 dark:text-white transition-colors"
                            placeholder="CEO / Admin"
                          />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email (Login)</label>
                      <div className="flex items-center gap-3 w-full bg-slate-100 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-slate-500 cursor-not-allowed">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-medium">{session?.user?.email}</span>
                      </div>
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-600 dark:text-orange-500">
                          <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tighter">Segurança</h3>
                  </div>
                  
                  <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nova Senha</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isDesktop} // Desabilita troca de senha no desktop
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-medium text-slate-700 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={isDesktop ? "Troca de senha indisponível offline" : "Deixe em branco para manter a atual"}
                      />
                  </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                  {message && (
                      <span className={`text-xs font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {message.text}
                      </span>
                  )}
                  {!message && <span></span>} 
                  
                  <button 
                    type="submit" 
                    disabled={loading || uploading}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                  </button>
              </div>
          </form>

          {/* CARD DE PLANO (AQUI ESTÁ A MUDANÇA PARA DESKTOP) */}
          <div className="flex flex-col gap-6">
            {isDesktop ? (
                // --- VERSÃO DESKTOP (LICENÇA VITALÍCIA) ---
                <div className="bg-slate-900 dark:bg-zinc-950 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-slate-800 h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Laptop className="w-32 h-32 text-white" /></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/20">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">Vitalício</span>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mt-1">Licença Desktop</h3>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-4">Funcionalidades Ativas:</p>
                            <div className="flex items-center gap-3 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Banco de Dados Local (SQLite)</div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Acesso Offline Completo</div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem Mensalidades</div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Registros Ilimitados</div>
                        </div>

                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl mb-6">
                            <div className="flex items-center gap-2 mb-2 text-rose-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Licença de Uso</span>
                            </div>
                            <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                                Esta licença é concedida para <strong>uso único e exclusivo</strong>. É estritamente proibida a revenda, cópia, aluguel ou comercialização deste software sem autorização expressa da A2 Solutions.
                            </p>
                        </div>

                        <div className="border-t border-slate-800 pt-6 mt-auto">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Suporte Técnico</p>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3 text-white text-sm font-bold">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">AA</div>
                                    <div>
                                        <p>Aristides de Araújo</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Consultor A2 Solutions</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <a href="#" className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold transition-all">
                                        <Smartphone className="w-3.5 h-3.5" /> (34) 99840-8962
                                    </a>
                                    <a href="#" className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-300 text-xs font-bold transition-all">
                                        <Mail className="w-3.5 h-3.5" /> suporte@a2solutions.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- VERSÃO WEB (NUVEM) ---
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden text-white h-full flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Cloud className="w-32 h-32" /></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Cloud className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Plano Atual</span>
                                <h3 className="text-xl font-black uppercase tracking-tighter mt-1">VittaCash Cloud</h3>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-center gap-3 text-indigo-100 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acesso em Qualquer Lugar</div>
                            <div className="flex items-center gap-3 text-indigo-100 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Backup Automático</div>
                            <div className="flex items-center gap-3 text-indigo-100 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sincronização em Tempo Real</div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 mt-auto">
                            <div className="flex items-center gap-2 mb-1 text-orange-300">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Migração</span>
                            </div>
                            <p className="text-xs text-indigo-100/80 leading-relaxed">
                                Deseja migrar para a versão Desktop offline sem mensalidades? Entre em contato com o suporte.
                            </p>
                        </div>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default ProfileSettings;