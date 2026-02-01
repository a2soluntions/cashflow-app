const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'vittacash.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function initDb() {
  // 1. Transações
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'offline_user',
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'pending',
      paid_amount REAL DEFAULT 0,
      is_recurring INTEGER DEFAULT 0,
      account_id TEXT DEFAULT 'acc1',
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Categorias
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'offline_user',
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Investimentos
  db.exec(`
    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'offline_user',
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      invested_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Metas
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT DEFAULT 'offline_user',
      title TEXT NOT NULL, 
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      deadline TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 5. Perfis (AGORA COM EMPRESA E CARGO)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY DEFAULT 'offline_user',
      full_name TEXT,
      company_name TEXT,
      role TEXT,
      avatar_url TEXT,
      email TEXT DEFAULT 'offline@vittacash.local',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Garante que existe um usuário padrão
  const user = db.prepare("SELECT * FROM profiles WHERE id = 'offline_user'").get();
  if (!user) {
    db.prepare("INSERT INTO profiles (id, full_name, email, company_name, role) VALUES (?, ?, ?, ?, ?)").run('offline_user', 'Usuário Offline', 'offline@vittacash.local', 'Minha Empresa', 'Admin');
  }

  console.log('✅ Banco VittaCash (Schema V5 - Completo) carregado.');
}

// --- FUNÇÕES CRUD ---

function getAll(table) {
  try { return db.prepare(`SELECT * FROM ${table}`).all(); } 
  catch (e) { console.error(e); return []; }
}

function insert(table, data) {
  const cleanData = { ...data };
  if (typeof cleanData.is_recurring === 'boolean') cleanData.is_recurring = cleanData.is_recurring ? 1 : 0;
  delete cleanData.id;
  
  const keys = Object.keys(cleanData);
  const values = Object.values(cleanData);
  const placeholders = keys.map(() => '?').join(',');
  
  const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders})`);
  return stmt.run(...values);
}

function remove(table, id) {
  return db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
}

function update(table, id, data) {
  const keys = Object.keys(data);
  const setString = keys.map(k => `${k} = ?`).join(',');
  const values = Object.values(data);
  return db.prepare(`UPDATE ${table} SET ${setString} WHERE id = ?`).run(...values, id);
}

module.exports = { initDb, getAll, insert, remove, update };