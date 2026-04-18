const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    // Esconde a barra de menus padrão do Windows para um visual mais limpo
    autoHideMenuBar: true, 
    icon: path.join(__dirname, 'public/icon.png'), // O seu logo majestoso na barra de tarefas
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Verifica se está rodando em modo de desenvolvimento ou produção (compilado)
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Em dev, ele lê direto do seu servidor local do React/Vite
    mainWindow.loadURL('http://localhost:5173'); 
  } else {
    // Em produção (no .exe), ele lê os arquivos compilados
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});