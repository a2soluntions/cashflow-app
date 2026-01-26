import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, Building2, Lock, Save, Mail, ShieldCheck, Camera } from 'lucide-react';

interface ProfileSettingsProps {
  session: any;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Dados do Formulário
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Carregar dados ao abrir
  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { user } = session;

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
      } catch (error) {
        console.log('Erro ao carregar perfil', error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session]);

  // Função de Upload de Foto
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Pegar a URL pública
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // 3. Atualizar estado local para preview imediato
      setAvatarUrl(data.publicUrl);
      setMessage({ text: 'Foto carregada! Clique em Salvar para confirmar.', type: 'success' });

    } catch (error) {
      setMessage({ text: 'Erro ao fazer upload da imagem.', type: 'error' });
      console.log(error);
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { user } = session;

      const updates = {
        id: user.id,
        full_name: fullName,
        company_name: companyName,
        role: role,
        avatar_url: avatarUrl, // Salva a URL da foto
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      
      // Se tiver senha para alterar
      if (password) {
          const { error: passError } = await supabase.auth.updateUser({ password: password });
          if (passError) throw passError;
          setPassword('');
      }

      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
    } catch (error) {
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
                      <span>{fullName ? fullName.charAt(0).toUpperCase() : session.user.email?.charAt(0).toUpperCase()}</span>
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
              <p className="text-xs text-slate-400">{session.user.email}</p>
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
                          <span className="text-sm font-medium">{session.user.email}</span>
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
                        className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl px-4 py-3 outline-none focus:border-orange-500 text-sm font-medium text-slate-700 dark:text-white transition-colors"
                        placeholder="Deixe em branco para manter a atual"
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

          {/* PLANO / INFO EXTRA */}
          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-emerald-900/20 h-full min-h-[300px]">
              <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="w-40 h-40" /></div>
              
              <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800/50 rounded-xl mb-4 border border-emerald-500/30">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Plano Pro</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-2">VittaCash <br/>Enterprise</h3>
                  <p className="text-emerald-200/80 text-sm font-medium max-w-xs">
                      Sua licença vitalícia está ativa. Você tem acesso a todos os recursos de gestão financeira e relatórios avançados.
                  </p>
              </div>

              <div className="relative z-10 pt-8 border-t border-emerald-800/50 mt-auto">
                  <div className="flex justify-between items-end">
                      <div>
                          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Status da Conta</p>
                          <p className="font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verificada</p>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Membro desde</p>
                          <p className="font-bold text-white">Jan, 2026</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileSettings;