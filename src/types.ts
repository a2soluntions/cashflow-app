export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  COMPLETED = 'completed', // Tem que ser minúsculo para bater com o banco
  PENDING = 'pending',     // Tem que ser minúsculo
}

export interface Transaction {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  status: TransactionStatus;
  paid_amount?: number;
  account_id?: string;
  is_recurring?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: TransactionType;
}

export interface Investment {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  invested_amount: number;
  current_amount: number;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  created_at?: string;
}