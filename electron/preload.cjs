const { contextBridge, ipcRenderer } = require('electron');

// Aqui nós expomos a API segura para o React usar
contextBridge.exposeInMainWorld('electronAPI', {
  // 1. Identidade: "Sou Desktop?" (MANTIDO)
  isDesktop: () => true,

  // 2. Comandos Universais de Banco de Dados (MANTIDO)
  // O React diz: "Me dê tudo de 'transactions'" -> O Preload pede ao Main -> O Main pede ao DB
  getAll: (table) => ipcRenderer.invoke('db-get-all', table),
  
  insert: (table, data) => ipcRenderer.invoke('db-insert', table, data),
  
  delete: (table, id) => ipcRenderer.invoke('db-delete', table, id),
  
  update: (table, id, data) => ipcRenderer.invoke('db-update', table, id, data),

  // 3. --- NOVA FUNÇÃO DE SEGURANÇA (ADICIONADO AGORA) ---
  // O Frontend (Tela de Bloqueio) chama isso para validar a chave no Supabase via Main.cjs
  validateLicense: (key) => ipcRenderer.invoke('validate-license', key),
});