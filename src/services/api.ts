import { supabase } from '../supabase';
import { Transaction, Category, Goal, Investment } from '../types';

interface SyncAction {
  id: string;
  table: string;
  method: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
}

const OFFLINE_QUEUE_KEY = 'a2mentor_offline_queue';

class ApiService {
  // --- OFFLINE SYNC MECHANISM ---
  private getOfflineQueue(): SyncAction[] {
    const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  }

  private saveToOfflineQueue(action: SyncAction) {
    const queue = this.getOfflineQueue();
    queue.push(action);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    console.log('Ação guardada offline na fila de sicronização:', action);
  }

  public async syncOfflineQueue() {
    if (!navigator.onLine) return;

    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Sincronizando ${queue.length} operações offline com a nuvem...`);
    const remainingQueue: SyncAction[] = [];

    for (const action of queue) {
      try {
        if (action.method === 'INSERT') {
          await supabase.from(action.table).insert([action.payload]);
        } else if (action.method === 'UPDATE') {
          await supabase.from(action.table).update(action.payload).eq('id', action.payload.id);
        } else if (action.method === 'DELETE') {
          await supabase.from(action.table).delete().eq('id', action.payload.id);
        }
      } catch (err) {
        console.error('Falha ao sicronizar ação, jogando de volta pra fila', action, err);
        remainingQueue.push(action); // Mantém na fila se der erro de rede
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
  }

  // Wrappers para Operações de BD que fazem Graceful Degradation pro Offline
  private async mutateWithSync(table: string, method: 'INSERT' | 'UPDATE' | 'DELETE', payload: any) {
    if (navigator.onLine) {
      try {
        if (method === 'INSERT') {
          const { error } = await supabase.from(table).insert([payload]);
          if (error) throw error;
        } else if (method === 'UPDATE') {
          const { error } = await supabase.from(table).update(payload).eq('id', payload.id);
          if (error) throw error;
        } else if (method === 'DELETE') {
          const { error } = await supabase.from(table).delete().eq('id', payload.id);
          if (error) throw error;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('fetch')) {
          // Fallback pra fila offline se foi timeout/rede
          this.saveToOfflineQueue({ id: Math.random().toString(), table, method, payload, timestamp: Date.now() });
        } else {
          console.error("Erro na mutação de BD:", err);
          throw err;
        }
      }
    } else {
      this.saveToOfflineQueue({ id: Math.random().toString(), table, method, payload, timestamp: Date.now() });
    }
  }

  // --- ENTIDADES ---

  // TRANSACTIONS
  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!navigator.onLine) {
      const fallback = localStorage.getItem('a2mentor_pro_transactions');
      return fallback ? JSON.parse(fallback) : [];
    }
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
    if (error) throw error;
    // Cache local imediato para fallback
    localStorage.setItem('a2mentor_pro_transactions', JSON.stringify(data || []));
    return data as Transaction[];
  }

  async addTransaction(transaction: Transaction) {
    await this.mutateWithSync('transactions', 'INSERT', transaction);
  }

  async updateTransaction(transaction: Transaction) {
    await this.mutateWithSync('transactions', 'UPDATE', transaction);
  }

  async deleteTransaction(id: string) {
    await this.mutateWithSync('transactions', 'DELETE', { id });
  }

  // CATEGORIES
  async getCategories(userId: string): Promise<Category[]> {
    if (!navigator.onLine) {
      const fallback = localStorage.getItem('a2mentor_pro_categories');
      return fallback ? JSON.parse(fallback) : [];
    }
    const { data, error } = await supabase.from('categories').select('*').eq('user_id', userId).order('name', { ascending: true });
    if (error) throw error;
    localStorage.setItem('a2mentor_pro_categories', JSON.stringify(data || []));
    return data as Category[];
  }

  async addCategory(category: Category) {
    await this.mutateWithSync('categories', 'INSERT', category);
  }

  async updateCategory(category: Category) {
    await this.mutateWithSync('categories', 'UPDATE', category);
  }

  async deleteCategory(id: string) {
    await this.mutateWithSync('categories', 'DELETE', { id });
  }

  // GOALS (HORIZONS)
  async getGoals(userId: string): Promise<Goal[]> {
    if (!navigator.onLine) {
      const fallback = localStorage.getItem('a2mentor_pro_goals');
      return fallback ? JSON.parse(fallback) : [];
    }
    const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    localStorage.setItem('a2mentor_pro_goals', JSON.stringify(data || []));
    return data as Goal[];
  }

  async addGoal(goal: Goal) {
    await this.mutateWithSync('goals', 'INSERT', goal);
  }

  async updateGoal(goal: Goal) {
    await this.mutateWithSync('goals', 'UPDATE', goal);
  }

  async deleteGoal(id: string) {
    await this.mutateWithSync('goals', 'DELETE', { id });
  }
  // INVESTMENTS (CARTEIRA DE ATIVOS)
  async getInvestments(userId: string): Promise<Investment[]> {
    if (!navigator.onLine) {
      const fallback = localStorage.getItem('a2mentor_pro_investments');
      return fallback ? JSON.parse(fallback) : [];
    }
    const { data, error } = await supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    localStorage.setItem('a2mentor_pro_investments', JSON.stringify(data || []));
    return data as Investment[];
  }

  async addInvestment(investment: Investment) {
    await this.mutateWithSync('investments', 'INSERT', investment);
  }

  async deleteInvestment(id: string) {
    await this.mutateWithSync('investments', 'DELETE', { id });
  }
  // Podem seguir exatamente o mesmo padrão do mutateWithSync!
}

export const appApi = new ApiService();

// Listener do SO para quando recuperar a rede
window.addEventListener('online', () => {
    appApi.syncOfflineQueue();
});
