/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // Formato YYYY-MM-DD
  account: string; // ID da conta correspondente
  status: 'paid' | 'pending';
  isSynced?: boolean;
  bankName?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card';
  balance: number;
  color: string;
  icon: string;
  creditLimit?: number;
  creditUsed?: number;
  synced?: boolean;
  syncBankCode?: string; // e.g. 'nubank', 'itau', 'bradesco', 'bb', 'inter'
  lastSyncDate?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Budget {
  id: string;
  category: string; // ID da categoria
  limitAmount: number;
  spentAmount: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface CardInvoice {
  id: string; // "cardId-YYYY-MM"
  cardId: string;
  month: string; // "YYYY-MM"
  status: 'open' | 'closed' | 'paid';
  dueDate: string; // "YYYY-MM-DD"
  closingDate: string; // "YYYY-MM-DD"
  limitAmount?: number; // custom limit for this month
  adjustedAmount?: number; // manual total override
  paymentDate?: string;
  paymentAccount?: string; // account ID used for payment
}

export interface BankSyncStep {
  id: 'select_bank' | 'credentials' | 'security' | 'fetching' | 'success';
  title: string;
}
