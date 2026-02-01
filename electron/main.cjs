const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const db = require('./db.cjs');

// --- 1. BIBLIOTECAS DE SEGURANÇA ---
const { machineIdSync } = require('node-machine-id');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// --- 2. CARREGAR CHAVES DO .ENV.LOCAL ---
// Ele procura o arquivo na raiz do projeto (uma pasta acima de onde este arquivo está)
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Pega as chaves do arquivo de configuração
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o Supabase (Apenas para validar licença, não afeta o banco local)
let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.error("❌ ERRO CRÍTICO: Chaves do Supabase não encontradas no .env.local!");
}

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: true,
  });

  // EM PRODUÇÃO: Mantenha isso comentado para o usuário não acessar os arquivos
  // console.log("📂 Abrindo pasta de dados em:", app.getPath('userData'));
  // shell.openPath(app.getPath('userData'));

  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // Útil para debug
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // 1. Inicia o Banco de Dados LOCAL (SQLite)
  try {
    db.initDb();
    console.log("✅ Banco de dados LOCAL carregado!");
  } catch (error) {
    console.error("❌ Erro ao iniciar banco local:", error);
  }

  // 2. Cria a Janela
  createWindow();

  // 3. CRUD Local (Mantém o sistema funcionando offline)
  ipcMain.handle('db-get-all', async (event, table) => { return db.getAll(table); });
  ipcMain.handle('db-insert', async (event, table, data) => { return db.insert(table, data); });
  ipcMain.handle('db-delete', async (event, table, id) => { return db.remove(table, id); });
  ipcMain.handle('db-update', async (event, table, id, data) => { return db.update(table, id, data); });

  // 4. --- SISTEMA DE SEGURANÇA (DRM) ---
  ipcMain.handle('validate-license', async (event, licenseKey) => {
    // Se não tiver internet ou chaves, falha por segurança
    if (!supabase) return { success: false, message: 'Erro de configuração do servidor.' };

    try {
      // a) Pega a "Impressão Digital" da Máquina (Placa-mãe/CPU)
      const hwId = machineIdSync(); 
      console.log("🔒 Validando Hardware ID:", hwId);

      // b) Busca a licença na Nuvem
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('key', licenseKey)
        .single();

      if (error || !data) {
        return { success: false, message: 'Licença não encontrada ou inválida.' };
      }

      // c) Verifica se está ativa
      if (data.status !== 'active') {
        return { success: false, message: 'Esta licença foi bloqueada.' };
      }

      // d) LÓGICA DE AMARRAÇÃO (BINDING)
      
      // CASO 1: É a primeira vez que usam essa chave?
      if (!data.machine_id) {
        console.log("🆕 Primeira ativação! Vinculando a esta máquina...");
        
        // Grava o ID desta máquina no banco. Agora a chave é "casada" com este PC.
        const { error: updateError } = await supabase
          .from('licenses')
          .update({ 
            machine_id: hwId, 
            activated_at: new Date().toISOString() 
          })
          .eq('key', licenseKey);
        
        if (updateError) return { success: false, message: 'Erro ao ativar licença. Tente novamente.' };
        
        return { success: true, message: 'Licença ativada com sucesso!' };
      }

      // CASO 2: A chave já tem dono. É este computador?
      if (data.machine_id !== hwId) {
        console.warn("🚨 TENTATIVA DE PIRATARIA DETECTADA");
        return { success: false, message: 'ACESSO NEGADO: Esta licença pertence a outro computador.' };
      }

      // CASO 3: Tudo certo, é o dono legítimo.
      return { success: true, message: 'Licença validada.' };

    } catch (err) {
      console.error("Erro na validação:", err);
      // Se der erro de internet, você pode decidir se bloqueia ou libera (cache)
      // Por segurança padrão, bloqueia se não conseguir validar.
      return { success: false, message: 'Sem conexão para validar a licença.' };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});