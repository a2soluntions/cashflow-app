// Caminho exato: src/types/index.ts

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export interface Transaction {
  id: string;
  type: TransactionType | 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
  account?: string;
  status?: TransactionStatus | 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'pending' | 'completed' | 'overdue';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  invested_amount: number;
  current_amount: number;
  date: string;
}