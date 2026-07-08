/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Account, Category, Transaction, Budget, Goal } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'expense', color: '#EF4444', icon: 'Utensils' },
  { id: 'cat-moradia', name: 'Moradia', type: 'expense', color: '#3B82F6', icon: 'Home' },
  { id: 'cat-transporte', name: 'Transporte', type: 'expense', color: '#F59E0B', icon: 'Car' },
  { id: 'cat-saude', name: 'Saúde', type: 'expense', color: '#10B981', icon: 'HeartPulse' },
  { id: 'cat-educacao', name: 'Educação', type: 'expense', color: '#8B5CF6', icon: 'GraduationCap' },
  { id: 'cat-lazer', name: 'Lazer', type: 'expense', color: '#EC4899', icon: 'Compass' },
  { id: 'cat-servicos', name: 'Assinaturas & Serviços', type: 'expense', color: '#06B6D4', icon: 'Tv' },
  { id: 'cat-outros-desp', name: 'Outras Despesas', type: 'expense', color: '#6B7280', icon: 'HelpCircle' },
  
  // Receitas
  { id: 'cat-salario', name: 'Salário', type: 'income', color: '#10B981', icon: 'Briefcase' },
  { id: 'cat-investimentos', name: 'Investimentos', type: 'income', color: '#F59E0B', icon: 'TrendingUp' },
  { id: 'cat-outros-rec', name: 'Outras Receitas', type: 'income', color: '#6B7280', icon: 'PlusCircle' },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-nubank',
    name: 'Nubank (Principal)',
    type: 'checking',
    balance: 4520.80,
    color: '#820AD1',
    icon: 'Smartphone',
    synced: true,
    syncBankCode: 'nubank',
    lastSyncDate: '2026-07-02'
  },
  {
    id: 'acc-itau',
    name: 'Itaú Personalité',
    type: 'checking',
    balance: 12850.00,
    color: '#FF6F00',
    icon: 'CreditCard',
    synced: false,
    syncBankCode: 'itau'
  },
  {
    id: 'acc-carteira',
    name: 'Dinheiro em Mão',
    type: 'cash',
    balance: 350.00,
    color: '#10B981',
    icon: 'Coins'
  },
  {
    id: 'acc-itau-visa',
    name: 'Cartão Itaú Click',
    type: 'credit_card',
    balance: -1850.40, // saldo negativo representa fatura atual acumulada
    color: '#1E293B',
    icon: 'CreditCard',
    creditLimit: 10000.00,
    creditUsed: 1850.40
  }
];

export const DEFAULT_BUDGETS: Budget[] = [
  { id: 'b-alimentacao', category: 'cat-alimentacao', limitAmount: 1200.00, spentAmount: 845.20 },
  { id: 'b-transporte', category: 'cat-transporte', limitAmount: 400.00, spentAmount: 298.50 },
  { id: 'b-lazer', category: 'cat-lazer', limitAmount: 500.00, spentAmount: 410.00 },
  { id: 'b-servicos', category: 'cat-servicos', limitAmount: 250.00, spentAmount: 189.90 },
];

export const DEFAULT_GOALS: Goal[] = [
  { id: 'g-reserva', name: 'Reserva de Emergência', targetAmount: 20000.00, currentAmount: 14500.00, deadline: '2026-12-31', color: '#10B981' },
  { id: 'g-viagem', name: 'Viagem de Fim de Ano', targetAmount: 8000.00, currentAmount: 3200.00, deadline: '2026-11-15', color: '#3B82F6' },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  // --- JULHO 2026 (Mês Atual) ---
  {
    id: 't-1',
    description: 'Salário Google Inc.',
    amount: 9500.00,
    type: 'income',
    category: 'cat-salario',
    date: '2026-07-01',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-2',
    description: 'Supermercado Pão de Açúcar',
    amount: 345.80,
    type: 'expense',
    category: 'cat-alimentacao',
    date: '2026-07-02',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-3',
    description: 'Uber para Escritório',
    amount: 32.50,
    type: 'expense',
    category: 'cat-transporte',
    date: '2026-07-02',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-4',
    description: 'Condomínio Julho',
    amount: 650.00,
    type: 'expense',
    category: 'cat-moradia',
    date: '2026-07-01',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-5',
    description: 'Assinatura Netflix',
    amount: 55.90,
    type: 'expense',
    category: 'cat-servicos',
    date: '2026-07-01',
    account: 'acc-itau-visa',
    status: 'paid',
    isSynced: false
  },

  // --- JUNHO 2026 (Mês Anterior) ---
  {
    id: 't-j1',
    description: 'Salário Google Inc.',
    amount: 9500.00,
    type: 'income',
    category: 'cat-salario',
    date: '2026-06-01',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-j2',
    description: 'Rendimento Poupança',
    amount: 85.40,
    type: 'income',
    category: 'cat-investimentos',
    date: '2026-06-05',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-j3',
    description: 'Aluguel do Apartamento',
    amount: 1800.00,
    type: 'expense',
    category: 'cat-moradia',
    date: '2026-06-10',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-j4',
    description: 'Churrascaria Fogo de Chão',
    amount: 450.00,
    type: 'expense',
    category: 'cat-alimentacao',
    date: '2026-06-12',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-j5',
    description: 'Cinema e Pipoca',
    amount: 120.00,
    type: 'expense',
    category: 'cat-lazer',
    date: '2026-06-14',
    account: 'acc-itau-visa',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-j6',
    description: 'Combustível Posto Ipiranga',
    amount: 220.00,
    type: 'expense',
    category: 'cat-transporte',
    date: '2026-06-18',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-j7',
    description: 'Farmácia Droga Raia',
    amount: 89.90,
    type: 'expense',
    category: 'cat-saude',
    date: '2026-06-20',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-j8',
    description: 'Assinatura Spotify',
    amount: 34.90,
    type: 'expense',
    category: 'cat-servicos',
    date: '2026-06-25',
    account: 'acc-itau-visa',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-j9',
    description: 'Curso de Inglês Alura',
    amount: 300.00,
    type: 'expense',
    category: 'cat-educacao',
    date: '2026-06-28',
    account: 'acc-itau-visa',
    status: 'paid',
    isSynced: false
  },

  // --- MAIO 2026 (Mês Retrasado) ---
  {
    id: 't-m1',
    description: 'Salário Google Inc.',
    amount: 9500.00,
    type: 'income',
    category: 'cat-salario',
    date: '2026-05-01',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-m2',
    description: 'Supermercado Carrefour',
    amount: 489.10,
    type: 'expense',
    category: 'cat-alimentacao',
    date: '2026-05-04',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  },
  {
    id: 't-m3',
    description: 'Aluguel do Apartamento',
    amount: 1800.00,
    type: 'expense',
    category: 'cat-moradia',
    date: '2026-05-10',
    account: 'acc-itau',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-m4',
    description: 'Viagem Petrópolis Fim de Semana',
    amount: 600.00,
    type: 'expense',
    category: 'cat-lazer',
    date: '2026-05-15',
    account: 'acc-itau-visa',
    status: 'paid',
    isSynced: false
  },
  {
    id: 't-m5',
    description: 'Uber Viagem longa',
    amount: 78.30,
    type: 'expense',
    category: 'cat-transporte',
    date: '2026-05-18',
    account: 'acc-nubank',
    status: 'paid',
    isSynced: true,
    bankName: 'Nubank'
  }
];

export const AVAILABLE_BANKS = [
  { code: 'nubank', name: 'Nubank', color: '#820AD1', logoText: 'Nu', textColor: 'text-white' },
  { code: 'itau', name: 'Banco Itaú', color: '#FF6F00', logoText: 'IT', textColor: 'text-white' },
  { code: 'bradesco', name: 'Bradesco', color: '#CC092F', logoText: 'Br', textColor: 'text-white' },
  { code: 'bb', name: 'Banco do Brasil', color: '#FDF123', logoText: 'BB', textColor: 'text-blue-900' },
  { code: 'inter', name: 'Banco Inter', color: '#FF7A00', logoText: 'In', textColor: 'text-white' },
  { code: 'c6', name: 'C6 Bank', color: '#1E1E1E', logoText: 'C6', textColor: 'text-white' },
  { code: 'neon', name: 'Neon', color: '#00E5FF', logoText: 'Ne', textColor: 'text-slate-900' },
  { code: 'picpay', name: 'PicPay', color: '#11C76F', logoText: 'Pp', textColor: 'text-white' },
  { code: 'mercadopago', name: 'Mercado Pago', color: '#009EE3', logoText: 'MP', textColor: 'text-white' },
  { code: 'pagbank', name: 'PagBank', color: '#00CD6C', logoText: 'PB', textColor: 'text-white' }
];

export const MOCK_BANK_TRANSACTIONS: Record<string, Omit<Transaction, 'id' | 'account' | 'status'>[]> = {
  nubank: [
    { description: 'Padaria de Panificação Real', amount: 18.50, type: 'expense', category: 'cat-alimentacao', date: '2026-07-02', isSynced: true, bankName: 'Nubank' },
    { description: 'Uber Trip 5X2Y', amount: 24.90, type: 'expense', category: 'cat-transporte', date: '2026-07-01', isSynced: true, bankName: 'Nubank' },
    { description: 'Farmácias Pague Menos', amount: 45.20, type: 'expense', category: 'cat-saude', date: '2026-06-30', isSynced: true, bankName: 'Nubank' },
    { description: 'Ifood Restaurante Japonês', amount: 112.00, type: 'expense', category: 'cat-alimentacao', date: '2026-06-29', isSynced: true, bankName: 'Nubank' },
    { description: 'Rendimento de Conta Corrente', amount: 12.45, type: 'income', category: 'cat-investimentos', date: '2026-07-01', isSynced: true, bankName: 'Nubank' }
  ],
  itau: [
    { description: 'Academia Bluefit Mensal', amount: 129.90, type: 'expense', category: 'cat-saude', date: '2026-07-02', isSynced: true, bankName: 'Itaú' },
    { description: 'Posto Shell Combustível', amount: 150.00, type: 'expense', category: 'cat-transporte', date: '2026-07-01', isSynced: true, bankName: 'Itaú' },
    { description: 'Pix Recebido de João Silva', amount: 350.00, type: 'income', category: 'cat-outros-rec', date: '2026-06-30', isSynced: true, bankName: 'Itaú' },
    { description: 'Restaurante Coco Bambu', amount: 280.00, type: 'expense', category: 'cat-alimentacao', date: '2026-06-28', isSynced: true, bankName: 'Itaú' }
  ],
  bradesco: [
    { description: 'Supermercado Extra', amount: 412.50, type: 'expense', category: 'cat-alimentacao', date: '2026-07-02', isSynced: true, bankName: 'Bradesco' },
    { description: 'Pedágio Sem Parar', amount: 28.40, type: 'expense', category: 'cat-transporte', date: '2026-07-01', isSynced: true, bankName: 'Bradesco' },
    { description: 'Restituição do Imposto de Renda', amount: 1450.00, type: 'income', category: 'cat-salario', date: '2026-06-25', isSynced: true, bankName: 'Bradesco' }
  ],
  bb: [
    { description: 'Tarifa de Conta Mensal', amount: 35.00, type: 'expense', category: 'cat-outros-desp', date: '2026-07-01', isSynced: true, bankName: 'Banco do Brasil' },
    { description: 'Livraria Cultura', amount: 89.90, type: 'expense', category: 'cat-educacao', date: '2026-06-29', isSynced: true, bankName: 'Banco do Brasil' },
    { description: 'Pix Recebido - Venda Notebook', amount: 2300.00, type: 'income', category: 'cat-outros-rec', date: '2026-06-28', isSynced: true, bankName: 'Banco do Brasil' }
  ],
  inter: [
    { description: 'Assinatura Amazon Prime', amount: 19.90, type: 'expense', category: 'cat-servicos', date: '2026-07-02', isSynced: true, bankName: 'Banco Inter' },
    { description: 'Recarga Celular Claro', amount: 40.00, type: 'expense', category: 'cat-servicos', date: '2026-07-01', isSynced: true, bankName: 'Banco Inter' },
    { description: 'Estacionamento Shopping', amount: 22.00, type: 'expense', category: 'cat-transporte', date: '2026-06-30', isSynced: true, bankName: 'Banco Inter' }
  ],
  c6: [
    { description: 'Assinatura Spotify Premium', amount: 34.90, type: 'expense', category: 'cat-servicos', date: '2026-07-02', isSynced: true, bankName: 'C6 Bank' },
    { description: 'Pedágio C6 Tag - Imigrantes', amount: 14.80, type: 'expense', category: 'cat-transporte', date: '2026-07-01', isSynced: true, bankName: 'C6 Bank' },
    { description: 'Restaurante Madero Burger', amount: 85.00, type: 'expense', category: 'cat-alimentacao', date: '2026-06-30', isSynced: true, bankName: 'C6 Bank' }
  ],
  neon: [
    { description: 'Pix Recebido - Reembolso Viagem', amount: 120.00, type: 'income', category: 'cat-outros-rec', date: '2026-07-02', isSynced: true, bankName: 'Neon' },
    { description: 'Netflix Assinatura Mensal', amount: 55.90, type: 'expense', category: 'cat-servicos', date: '2026-07-01', isSynced: true, bankName: 'Neon' },
    { description: 'Supermercado Pão de Açúcar', amount: 215.40, type: 'expense', category: 'cat-alimentacao', date: '2026-06-29', isSynced: true, bankName: 'Neon' }
  ],
  picpay: [
    { description: 'PicPay Card Cashback', amount: 15.20, type: 'income', category: 'cat-outros-rec', date: '2026-07-02', isSynced: true, bankName: 'PicPay' },
    { description: 'Depósito em Carteira', amount: 500.00, type: 'income', category: 'cat-outros-rec', date: '2026-07-01', isSynced: true, bankName: 'PicPay' },
    { description: 'Ifood Lanche da Tarde', amount: 42.50, type: 'expense', category: 'cat-alimentacao', date: '2026-06-30', isSynced: true, bankName: 'PicPay' }
  ],
  mercadopago: [
    { description: 'Venda Mercado Livre - Teclado', amount: 320.00, type: 'income', category: 'cat-salario', date: '2026-07-02', isSynced: true, bankName: 'Mercado Pago' },
    { description: 'Assinatura Disney+ Star+', amount: 43.90, type: 'expense', category: 'cat-servicos', date: '2026-07-01', isSynced: true, bankName: 'Mercado Pago' },
    { description: 'Posto Ipiranga Combustível', amount: 90.00, type: 'expense', category: 'cat-transporte', date: '2026-06-30', isSynced: true, bankName: 'Mercado Pago' }
  ],
  pagbank: [
    { description: 'Rendimento CDB PagBank', amount: 25.80, type: 'income', category: 'cat-investimentos', date: '2026-07-02', isSynced: true, bankName: 'PagBank' },
    { description: 'Compra de Ferramentas Leroy', amount: 189.90, type: 'expense', category: 'cat-outros-desp', date: '2026-07-01', isSynced: true, bankName: 'PagBank' }
  ]
};
