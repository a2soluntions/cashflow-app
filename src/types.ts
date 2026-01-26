import { ReactNode } from "react";

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  category?: string; // Novo campo
  date: string;
  account_id: string;
  user_id: string;
  paid_amount?: number;
  is_recurring?: boolean;
  created_at?: string;
}

export interface Investment {
  id: string;
  name: string;
  type?: string;
  category: string;
  invested_amount: number;
  current_amount: number;
  created_at: string;
}
// ... (mantenha os outros tipos iguais)

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

// ADICIONE ISTO:
export interface Goal {
  description: ReactNode;
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  color?: string;
}