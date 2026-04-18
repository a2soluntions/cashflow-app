import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, dbOperations } from './db.js'; // Garantindo a extensão .js para o modo ESM

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'Vitta',
    backgroundColor: '#09090b',
    show: false, // Só mostra quando estiver pronto para evitar o flash branco
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Em desenvolvimento, usa a URL do servidor Vite
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Em produção, carrega o arquivo index.html compilado
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Mostra a janela suavemente
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialização do App
app.whenReady().then(() => {
  initDB(); // Inicializa o Banco SQLite (Tabelas e Conexão)
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- COMUNICAÇÃO COM O BANCO DE DADOS (IPC) ---

// Canal para buscar transações
ipcMain.handle('db:get-transactions', async () => {
  return dbOperations.getTransactions();
});

// Canal para buscar o saldo consolidado
ipcMain.handle('db:get-balance', async () => {
  return dbOperations.getBalance();
});

// Canal para adicionar nova transação
ipcMain.handle('db:add-transaction', async (_event, transaction) => {
  return dbOperations.addTransaction(transaction);
});