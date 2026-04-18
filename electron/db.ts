import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = process.env.NODE_ENV === 'development'
  ? './vittacash.db'
  : path.join(app.getPath('userData'), 'vittacash.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT,
      date TEXT NOT NULL
    );
  `);
}

export const dbOperations = {
  getTransactions: () => db.prepare('SELECT * FROM transactions ORDER BY date DESC').all(),
  
  addTransaction: (t: any) => {
    const stmt = db.prepare('INSERT INTO transactions (id, description, amount, type, category, date) VALUES (@id, @description, @amount, @type, @category, @date)');
    return stmt.run(t);
  },

  // ADICIONE ESTA FUNÇÃO ABAIXO:
  getBalance: () => {
    const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income'").get() as any;
    const expense = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense'").get() as any;
    
    const totalIncome = income?.total || 0;
    const totalExpense = expense?.total || 0;

    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }
};