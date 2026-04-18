import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  addTransaction: (t) => ipcRenderer.invoke('add-transaction', t),
});