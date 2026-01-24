
import { TransactionType, TransactionStatus, Transaction, Investment } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    user_id: 'user1',
    account_id: 'acc1',
    category_id: 'cat1',
    amount: 5000,
    type: TransactionType.INCOME,
    status: TransactionStatus.COMPLETED,
    description: 'Salário Mensal',
    date: '2024-03-01',
    is_recurring: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    account_id: 'acc1',
    category_id: 'cat2',
    amount: 1200,
    type: TransactionType.EXPENSE,
    status: TransactionStatus.COMPLETED,
    description: 'Aluguel',
    date: '2024-03-05',
    is_recurring: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user1',
    account_id: 'acc1',
    category_id: 'cat3',
    amount: 450,
    type: TransactionType.EXPENSE,
    status: TransactionStatus.COMPLETED,
    description: 'Supermercado',
    date: '2024-03-10',
    is_recurring: false,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'user1',
    account_id: 'acc1',
    category_id: 'cat4',
    amount: 3000,
    type: TransactionType.EXPENSE,
    status: TransactionStatus.COMPLETED,
    description: 'Gadgets Eletrônicos',
    date: '2024-03-12',
    is_recurring: false,
    created_at: new Date().toISOString()
  }
];

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv1',
    user_id: 'user1',
    name: 'Apple Inc (AAPL)',
    category: 'Ações',
    invested_amount: 1500,
    current_amount: 1850,
    created_at: new Date().toISOString()
  },
  {
    id: 'inv2',
    user_id: 'user1',
    name: 'Tesouro Direto Selic',
    category: 'Renda Fixa',
    invested_amount: 5000,
    current_amount: 5200,
    created_at: new Date().toISOString()
  }
];
