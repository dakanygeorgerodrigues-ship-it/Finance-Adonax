/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Account, Transaction, Budget, Goal, CardInvoice, Category } from './types';
import { 
  DEFAULT_ACCOUNTS, 
  DEFAULT_TRANSACTIONS, 
  DEFAULT_BUDGETS, 
  DEFAULT_GOALS, 
  DEFAULT_CATEGORIES,

} from './data';

import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import Reports from './components/Reports';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import AccountsManager from './components/AccountsManager';
import CreditCards from './components/CreditCards';
import Login from './components/Login';
import Profile from './components/Profile';
import GuidedTour from './components/GuidedTour';
import adonaxLogo from './assets/images/adonax_logo_1783458543607.jpg';

import { 
  PiggyBank,
  Building, 
  ListOrdered, 
  TrendingUp, 
  DollarSign, 
  RefreshCw, 
  User, 
  Wallet, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  CreditCard,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { supabase, hasSupabaseConfig } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('org_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('org_user_session') !== null;
    } catch {
      return false;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Sincroniza estado de login e usuário com o localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('org_user_session', JSON.stringify(user));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('org_user_session');
      setIsLoggedIn(false);
    }
  }, [user]);

  // Helpers de Sincronização em Nuvem (Supabase)
  const toUUID = (id: string, userId?: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id.toLowerCase();

    // Remove prefixes to make it cleaner before hashing
    const cleanId = id.replace(/^(acc|cat|b|g|tx|inv)-/, '');

    // Salt with userId if provided to avoid conflicts between different users' default data
    const inputStr = userId ? `${cleanId}-${userId}` : cleanId;

    // Simple robust hash function to generate 4 distinct 32-bit unsigned integers
    const hashString = (str: string, seed: number): number => {
      let h = seed;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
      }
      return h >>> 0;
    };

    const h1 = hashString(inputStr, 0x811c9dc5);
    const h2 = hashString(inputStr + "-salt1", 0x811c9dc5);
    const h3 = hashString(inputStr + "-salt2", 0x811c9dc5);
    const h4 = hashString(inputStr + "-salt3", 0x811c9dc5);

    const hex1 = h1.toString(16).padStart(8, '0');
    const hex2 = h2.toString(16).padStart(8, '0');
    const hex3 = h3.toString(16).padStart(8, '0');
    const hex4 = h4.toString(16).padStart(8, '0');

    const hex = hex1 + hex2 + hex3 + hex4;

    const part1 = hex.substring(0, 8);
    const part2 = hex.substring(8, 12);
    const part3 = '4' + hex.substring(13, 16);
    const part4 = 'a' + hex.substring(17, 20);
    const part5 = hex.substring(20, 32);

    return `${part1}-${part2}-${part3}-${part4}-${part5}`.toLowerCase();
  };

  const syncToCloud = async (tableName: string, data: any[]) => {
    if (!hasSupabaseConfig || !user || user.id === 'guest' || user.id.startsWith('local-')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn(`[Cloud Sync] Sem sessão ativa no Supabase para sincronizar a tabela ${tableName}. Mantendo dados salvos localmente.`);
        return;
      }

      const mappedData = data.map(item => {
        const base: any = {
          id: toUUID(item.id, user.id),
          user_id: user.id
        };

        if (tableName === 'categories') {
          base.name = item.name;
          base.type = item.type;
          base.color = item.color;
          base.icon = item.icon;
        } else if (tableName === 'accounts') {
          base.name = item.name;
          base.type = item.type;
          base.balance = item.balance;
          base.color = item.color;
          base.icon = item.icon;
          base.credit_limit = item.creditLimit || null;
          base.credit_used = item.creditUsed || 0;
          base.synced = item.synced || false;
          base.sync_bank_code = item.syncBankCode || null;
          base.last_sync_date = item.lastSyncDate || null;
        } else if (tableName === 'transactions') {
          base.description = item.description;
          base.amount = item.amount;
          base.type = item.type;
          base.category_id = toUUID(item.category, user.id);
          base.date = item.date;
          base.account_id = toUUID(item.account, user.id);
          base.status = item.status;
          base.is_synced = item.isSynced || false;
          base.bank_name = item.bankName || null;
        } else if (tableName === 'budgets') {
          base.category_id = toUUID(item.category, user.id);
          base.limit_amount = item.limitAmount;
          base.spent_amount = item.spentAmount;
        } else if (tableName === 'goals') {
          base.name = item.name;
          base.target_amount = item.targetAmount;
          base.current_amount = item.currentAmount;
          base.deadline = item.deadline || null;
          base.color = item.color;
        } else if (tableName === 'card_invoices') {
          base.card_id = toUUID(item.cardId, user.id);
          base.month = item.month;
          base.status = item.status;
          base.due_date = item.dueDate;
          base.closing_date = item.closingDate;
          base.limit_amount = item.limitAmount || null;
          base.adjusted_amount = item.adjustedAmount || null;
          base.payment_date = item.paymentDate || null;
          base.payment_account_id = item.paymentAccount ? toUUID(item.paymentAccount, user.id) : null;
        }

        return base;
      });

      if (mappedData.length > 0) {
        const { error } = await supabase.from(tableName).upsert(mappedData);
        if (error) {
          console.error(`[Cloud Sync] Erro no upsert de ${tableName}:`, JSON.stringify(error, null, 2));
        }
      }
    } catch (err) {
      console.error(`[Cloud Sync] Falha ao sincronizar com tabela ${tableName}:`, err);
    }
  };

  const deleteFromCloud = async (tableName: string, id: string) => {
    if (!hasSupabaseConfig || !user || user.id === 'guest' || user.id.startsWith('local-')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.from(tableName).delete().eq('id', toUUID(id, user.id));
      if (error) console.error(`[Cloud Sync] Erro ao deletar de ${tableName}:`, error);
    } catch (err) {
      console.error(`[Cloud Sync] Falha ao deletar da nuvem na tabela ${tableName}:`, err);
    }
  };

  const loadFromCloud = async (userId: string) => {
    if (!hasSupabaseConfig || !userId || userId === 'guest' || userId.startsWith('local-')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("[Cloud Sync] Nenhuma sessão ativa no Supabase para carregar dados da nuvem. Mantendo dados locais.");
        return;
      }

      const [
        { data: catData, error: catError },
        { data: accData, error: accError },
        { data: txData, error: txError },
        { data: budData, error: budError },
        { data: goalData, error: goalError },
        { data: invData, error: invError }
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('user_id', userId),
        supabase.from('accounts').select('*').eq('user_id', userId),
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('budgets').select('*').eq('user_id', userId),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('card_invoices').select('*').eq('user_id', userId)
      ]);

      if (catError || accError || txError || budError || goalError || invError) {
        console.warn("[Cloud Sync] Erro ao buscar tabelas do Supabase, ignorando carga da nuvem para evitar sobrescrever dados locais.");
        return;
      }

      const hasAnyCloudData = (catData?.length || 0) > 0 || (accData?.length || 0) > 0 || (txData?.length || 0) > 0;
      const getKey = (name: string) => `${name}_${userId}`;

      if (hasAnyCloudData) {
        // Restaurar dados da nuvem
        const restoredCategories = catData && catData.length > 0 
          ? catData.map(item => ({
              id: item.id,
              name: item.name,
              type: item.type as 'income' | 'expense',
              color: item.color,
              icon: item.icon
            }))
          : DEFAULT_CATEGORIES;

        const restoredAccounts: Account[] = (accData || []).map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as any,
          balance: Number(item.balance),
          color: item.color,
          icon: item.icon,
          creditLimit: item.credit_limit ? Number(item.credit_limit) : undefined,
          creditUsed: item.credit_used ? Number(item.credit_used) : undefined,
          synced: item.synced,
          syncBankCode: item.sync_bank_code,
          lastSyncDate: item.last_sync_date
        }));

        const restoredTransactions: Transaction[] = (txData || []).map(item => ({
          id: item.id,
          description: item.description,
          amount: Number(item.amount),
          type: item.type as any,
          category: item.category_id,
          date: item.date,
          account: item.account_id,
          status: item.status as any,
          isSynced: item.is_synced,
          bankName: item.bank_name
        }));

        const restoredBudgets: Budget[] = (budData || []).map(item => ({
          id: item.id,
          category: item.category_id,
          limitAmount: Number(item.limit_amount),
          spentAmount: Number(item.spent_amount)
        }));

        const restoredGoals: Goal[] = (goalData || []).map(item => ({
          id: item.id,
          name: item.name,
          targetAmount: Number(item.target_amount),
          currentAmount: Number(item.current_amount),
          deadline: item.deadline || undefined,
          color: item.color
        }));

        const restoredCardInvoices: CardInvoice[] = (invData || []).map(item => ({
          id: item.id,
          cardId: item.card_id,
          month: item.month,
          status: item.status as any,
          dueDate: item.due_date,
          closingDate: item.closing_date,
          limitAmount: item.limit_amount ? Number(item.limit_amount) : undefined,
          adjustedAmount: item.adjusted_amount ? Number(item.adjusted_amount) : undefined,
          paymentDate: item.payment_date || undefined,
          paymentAccount: item.payment_account_id || undefined
        }));

        setCategories(restoredCategories);
        setAccounts(restoredAccounts);
        setTransactions(restoredTransactions);
        setBudgets(restoredBudgets);
        setGoals(restoredGoals);
        setCardInvoices(restoredCardInvoices);

        localStorage.setItem(getKey('org_categories'), JSON.stringify(restoredCategories));
        localStorage.setItem(getKey('org_accounts'), JSON.stringify(restoredAccounts));
        localStorage.setItem(getKey('org_transactions'), JSON.stringify(restoredTransactions));
        localStorage.setItem(getKey('org_budgets'), JSON.stringify(restoredBudgets));
        localStorage.setItem(getKey('org_goals'), JSON.stringify(restoredGoals));
        localStorage.setItem(getKey('org_card_invoices'), JSON.stringify(restoredCardInvoices));
      } else {
        // Nuvem está vazia, faz o primeiro upload dos dados do localStorage local para a nuvem
        const localAccounts = localStorage.getItem(getKey('org_accounts'));
        const localTransactions = localStorage.getItem(getKey('org_transactions'));
        const localBudgets = localStorage.getItem(getKey('org_budgets'));
        const localGoals = localStorage.getItem(getKey('org_goals'));
        const localCardInvoices = localStorage.getItem(getKey('org_card_invoices'));
        const localCategories = localStorage.getItem(getKey('org_categories'));

        const accs = localAccounts ? JSON.parse(localAccounts) : [];
        const txs = localTransactions ? JSON.parse(localTransactions) : [];
        const buds = localBudgets ? JSON.parse(localBudgets) : [];
        const gls = localGoals ? JSON.parse(localGoals) : [];
        const invs = localCardInvoices ? JSON.parse(localCardInvoices) : [];
        const cats = localCategories ? JSON.parse(localCategories) : DEFAULT_CATEGORIES;

        if (cats.length > 0) await syncToCloud('categories', cats);
        if (accs.length > 0) await syncToCloud('accounts', accs);
        if (txs.length > 0) await syncToCloud('transactions', txs);
        if (buds.length > 0) await syncToCloud('budgets', buds);
        if (gls.length > 0) await syncToCloud('goals', gls);
        if (invs.length > 0) await syncToCloud('card_invoices', invs);
      }
    } catch (err) {
      console.error("[Cloud Sync] Erro ao executar sincronização de dados:", err);
    }
  };

  // 1. Estados Centrais da Aplicação

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cardInvoices, setCardInvoices] = useState<CardInvoice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Mes selecionado padrao (Julho de 2026)
  const [currentMonth, setCurrentMonth] = useState<string>('2026-07');
  
  // Controle de Tabs (Navegação Principal)
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Trigger para abrir o modal de nova transação diretamente na aba Lançamentos
  const [activeAddModalType, setActiveAddModalType] = useState<'income' | 'expense' | null>(null);

  // Controle de exibição do Tour Guiado
  const [showTour, setShowTour] = useState<boolean>(false);

  // Estado para Sincronização Manual com Nuvem
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Estado para controlar se a autenticação inicial do Supabase foi resolvida
  const [isAuthInitialized, setIsAuthInitialized] = useState<boolean>(false);

  // Perfil do Usuário (Simulado a partir dos metadados recebidos)
  const userEmail = user?.email || "dakany.georgerodrigues@gmail.com";
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "George Rodrigues";

  // Sincronização manual acionada pelo cabeçalho ou abas
  const handleManualSync = async () => {
    if (!hasSupabaseConfig || !user || user.id === 'guest' || user.id.startsWith('local-')) return;
    setIsSyncing(true);
    try {
      await loadFromCloud(user.id);
      // Busca dados mais recentes do usuário para atualizar nome/perfil
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch (err) {
      console.error("[Cloud Sync] Erro na sincronização manual:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Verificar sessao inicial Supabase e recuperar perfil atualizado
  useEffect(() => {
    if (!hasSupabaseConfig) {
      setIsAuthInitialized(true);
      return;
    }

    // Busca usuário atualizado na API para garantir que pegamos metadados recentes sincronizados de outros apps/dispositivos
    supabase.auth.getUser().then(({ data: { user: freshUser } }) => {
      if (freshUser) {
        setUser(freshUser);
      } else {
        // Se getUser falhar ou retornar nulo, e o usuário atual não for guest, limpa a sessão inválida/expirada!
        const saved = localStorage.getItem('org_user_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id !== 'guest' && !parsed.id.startsWith('local-')) {
              localStorage.removeItem('org_user_session');
              setUser(null);
              setIsLoggedIn(false);
            }
          } catch {
            localStorage.removeItem('org_user_session');
            setUser(null);
            setIsLoggedIn(false);
          }
        }
      }
      setIsAuthInitialized(true);
    }).catch(() => {
      setIsAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Efeito de Carregamento Inicial do LocalStorage
  useEffect(() => {
    if (!isAuthInitialized) return;
    if (!isLoggedIn) return;
    
    const userId = user?.id || 'guest';
    const getKey = (name: string) => `${name}_${userId}`;
    
    const getStoredData = (baseKey: string) => {
      let data = localStorage.getItem(getKey(baseKey));
      if (!data && userId !== 'guest') {
        // Migration fallback: copy from guest if exists, otherwise from old format without suffix
        data = localStorage.getItem(`${baseKey}_guest`) || localStorage.getItem(baseKey);
        // Persist the migrated data into the new user's key
        if (data) {
          localStorage.setItem(getKey(baseKey), data);
        }
      }
      return data;
    };

    try {
      const storedAccounts = getStoredData('org_accounts');
      const storedTransactions = getStoredData('org_transactions');
      const storedBudgets = getStoredData('org_budgets');
      const storedGoals = getStoredData('org_goals');
      const storedCardInvoices = getStoredData('org_card_invoices');
      const storedCategories = getStoredData('org_categories');

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts([]);
        localStorage.setItem(getKey('org_accounts'), JSON.stringify([]));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions([]);
        localStorage.setItem(getKey('org_transactions'), JSON.stringify([]));
      }

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        setBudgets([]);
        localStorage.setItem(getKey('org_budgets'), JSON.stringify([]));
      }

      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      } else {
        setGoals([]);
        localStorage.setItem(getKey('org_goals'), JSON.stringify([]));
      }

      if (storedCardInvoices) {
        setCardInvoices(JSON.parse(storedCardInvoices));
      } else {
        setCardInvoices([]);
        localStorage.setItem(getKey('org_card_invoices'), JSON.stringify([]));
      }

      if (storedCategories) {
        setCategories(JSON.parse(storedCategories));
      } else {
        setCategories(DEFAULT_CATEGORIES);
        localStorage.setItem(getKey('org_categories'), JSON.stringify(DEFAULT_CATEGORIES));
      }

      // Inicializa exibição do Tour se não concluído
      const tourCompleted = localStorage.getItem(getKey('org_tour_completed'));
      if (!tourCompleted) {
        setShowTour(true);
      } else {
        setShowTour(false);
      }

      // NOVO: Se o usuário estiver logado e não for visitante e não for local, busca e sincroniza com o banco de dados Supabase na nuvem!
      if (hasSupabaseConfig && userId !== 'guest' && !userId.startsWith('local-')) {
        loadFromCloud(userId);
      }

    } catch (e) {
      console.error("Falha ao ler dados do localStorage. Usando dados padrão.", e);
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setCardInvoices([]);
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [isLoggedIn, user?.id, isAuthInitialized]);

  // Efeito para alternar tema
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Efeito para sincronizar os saldos dos cartões de crédito automaticamente quando as transações ou faturas mudam
  useEffect(() => {
    if (accounts.length === 0) return; // Aguarda carregamento inicial

    const recalculated = accounts.map(acc => {
      if (acc.type !== 'credit_card') return acc;

      const creditLimit = acc.creditLimit || 5000;
      const allMonthsSet = new Set<string>();
      transactions
        .filter(t => t.account === acc.id)
        .forEach(t => allMonthsSet.add(t.date.slice(0, 7)));
      cardInvoices
        .filter(inv => inv.cardId === acc.id)
        .forEach(inv => allMonthsSet.add(inv.month));

      let totalUnpaid = 0;

      allMonthsSet.forEach(monthStr => {
        const inv = cardInvoices.find(i => i.cardId === acc.id && i.month === monthStr);
        if (inv && inv.status === 'paid') {
          return; // Já pago, não consome limite
        }

        if (inv && inv.adjustedAmount !== undefined) {
          totalUnpaid += inv.adjustedAmount;
        } else {
          const monthTxSum = transactions
            .filter(t => t.account === acc.id && t.date.startsWith(monthStr) && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
          totalUnpaid += monthTxSum;
        }
      });

      if (acc.creditUsed !== totalUnpaid || acc.balance !== -totalUnpaid) {
        return {
          ...acc,
          creditUsed: totalUnpaid,
          balance: -totalUnpaid
        };
      }
      return acc;
    });

    const hasChanges = recalculated.some((acc, idx) => acc !== accounts[idx]);
    if (hasChanges) {
      saveAccountsToStorage(recalculated);
    }
  }, [transactions, cardInvoices, accounts]);

  // Helper para obter chave do localStorage por usuário
  const getStorageKey = (base: string) => `${base}_${user?.id || 'guest'}`;

  // 3. Persistência Automática de Mudanças
  const saveAccountsToStorage = (newAccs: Account[]) => {
    setAccounts(newAccs);
    localStorage.setItem(getStorageKey('org_accounts'), JSON.stringify(newAccs));
    syncToCloud('accounts', newAccs);
  };

  const saveTransactionsToStorage = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    localStorage.setItem(getStorageKey('org_transactions'), JSON.stringify(newTxs));
    syncToCloud('transactions', newTxs);
  };

  const saveBudgetsToStorage = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    localStorage.setItem(getStorageKey('org_budgets'), JSON.stringify(newBudgets));
    syncToCloud('budgets', newBudgets);
  };

  const saveGoalsToStorage = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(getStorageKey('org_goals'), JSON.stringify(newGoals));
    syncToCloud('goals', newGoals);
  };

  const saveCardInvoicesToStorage = (newInvs: CardInvoice[]) => {
    setCardInvoices(newInvs);
    localStorage.setItem(getStorageKey('org_card_invoices'), JSON.stringify(newInvs));
    syncToCloud('card_invoices', newInvs);
  };

  const handleAddCategory = (newCategoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...newCategoryData,
      id: `cat-${Date.now()}`
    };
    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    localStorage.setItem(getStorageKey('org_categories'), JSON.stringify(newCategories));
    syncToCloud('categories', newCategories);
  };

  const handleDeleteCategory = (id: string) => {
    const newCategories = categories.filter(c => c.id !== id);
    setCategories(newCategories);
    localStorage.setItem(getStorageKey('org_categories'), JSON.stringify(newCategories));
    syncToCloud('categories', newCategories);
    deleteFromCloud('categories', id);
  };

  const handleAddAccount = (newAccData: Omit<Account, 'id'>) => {
    const newAcc: Account = {
      ...newAccData,
      id: `acc-${Date.now()}`
    };
    saveAccountsToStorage([...accounts, newAcc]);
  };

  const handleEditAccount = (id: string, updates: Partial<Account>) => {
    const updated = accounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc);
    saveAccountsToStorage(updated);
  };

  const handleDeleteAccount = (id: string) => {
    const remainingAccs = accounts.filter(acc => acc.id !== id);
    const txsToDelete = transactions.filter(t => t.account === id);
    const invoicesToDelete = cardInvoices.filter(inv => inv.cardId === id);

    saveAccountsToStorage(remainingAccs);
    saveTransactionsToStorage(transactions.filter(t => t.account !== id));
    saveCardInvoicesToStorage(cardInvoices.filter(inv => inv.cardId !== id));

    deleteFromCloud('accounts', id);
    txsToDelete.forEach(t => deleteFromCloud('transactions', t.id));
    invoicesToDelete.forEach(inv => deleteFromCloud('card_invoices', inv.id));
  };

  const handleUpdateInvoice = (invoice: CardInvoice) => {
    const exists = cardInvoices.some(inv => inv.id === invoice.id);
    let updated: CardInvoice[];
    if (exists) {
      updated = cardInvoices.map(inv => inv.id === invoice.id ? invoice : inv);
    } else {
      updated = [...cardInvoices, invoice];
    }
    saveCardInvoicesToStorage(updated);
  };

  // 4. Operações de Saldo Financeiro Auxiliares
  // Ajusta o saldo de uma conta específica
  const adjustAccountBalance = (accs: Account[], accountId: string, amount: number, type: 'income' | 'expense', operation: 'add' | 'delete') => {
    return accs.map(acc => {
      if (acc.id === accountId) {
        const factor = operation === 'add' ? 1 : -1;
        const change = amount * factor;
        
        if (acc.type === 'credit_card') {
          // Para cartão de crédito: despesa adicionada aumenta a fatura utilizada (saldo fica mais negativo)
          if (type === 'expense') {
            const newCreditUsed = Math.max(0, (acc.creditUsed || 0) + change);
            return {
              ...acc,
              balance: -newCreditUsed,
              creditUsed: newCreditUsed
            };
          } else {
            const newCreditUsed = Math.max(0, (acc.creditUsed || 0) - change);
            return {
              ...acc,
              balance: -newCreditUsed,
              creditUsed: newCreditUsed
            };
          }
        } else {
          // Para conta corrente: receita adicionada aumenta o saldo. despesa diminui o saldo.
          if (type === 'income') {
            return { ...acc, balance: acc.balance + change };
          } else {
            return { ...acc, balance: acc.balance - change };
          }
        }
      }
      return acc;
    });
  };

  // 5. Handlers de Transações (CRUD)
  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };

    setTransactions(prev => {
      const updated = [newTx, ...prev];
      localStorage.setItem(getStorageKey('org_transactions'), JSON.stringify(updated));
      syncToCloud('transactions', updated);
      return updated;
    });

    // Ajustar saldo correspondente se estiver pago
    if (newTx.status === 'paid') {
      setAccounts(prev => {
        const updated = adjustAccountBalance(prev, newTx.account, newTx.amount, newTx.type, 'add');
        localStorage.setItem(getStorageKey('org_accounts'), JSON.stringify(updated));
        syncToCloud('accounts', updated);
        return updated;
      });
    }
  };

  const handleEditTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prevTxs => {
      const originalTx = prevTxs.find(t => t.id === id);
      if (!originalTx) return prevTxs;

      // Se o status da transação mudou ou o valor mudou, precisamos recalcular os saldos
      setAccounts(prevAccs => {
        let updatedAccounts = [...prevAccs];
        
        // 1. Reverter efeito da transação original (se estava paga)
        if (originalTx.status === 'paid') {
          updatedAccounts = adjustAccountBalance(updatedAccounts, originalTx.account, originalTx.amount, originalTx.type, 'delete');
        }

        // 3. Aplicar efeito da transação atualizada (se está paga)
        const finalTx = { ...originalTx, ...updates } as Transaction;
        if (finalTx.status === 'paid') {
          updatedAccounts = adjustAccountBalance(updatedAccounts, finalTx.account, finalTx.amount, finalTx.type, 'add');
        }

        localStorage.setItem(getStorageKey('org_accounts'), JSON.stringify(updatedAccounts));
        syncToCloud('accounts', updatedAccounts);
        return updatedAccounts;
      });

      const updatedTransactions = prevTxs.map(t => {
        if (t.id === id) {
          return { ...t, ...updates } as Transaction;
        }
        return t;
      });

      localStorage.setItem(getStorageKey('org_transactions'), JSON.stringify(updatedTransactions));
      syncToCloud('transactions', updatedTransactions);
      return updatedTransactions;
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prevTxs => {
      const tx = prevTxs.find(t => t.id === id);
      if (!tx) return prevTxs;

      const updatedTransactions = prevTxs.filter(t => t.id !== id);
      localStorage.setItem(getStorageKey('org_transactions'), JSON.stringify(updatedTransactions));
      syncToCloud('transactions', updatedTransactions);
      deleteFromCloud('transactions', id);

      // Reverter saldo correspondente se estava pago
      if (tx.status === 'paid') {
        setAccounts(prevAccs => {
          const updatedAccounts = adjustAccountBalance(prevAccs, tx.account, tx.amount, tx.type, 'delete');
          localStorage.setItem(getStorageKey('org_accounts'), JSON.stringify(updatedAccounts));
          syncToCloud('accounts', updatedAccounts);
          return updatedAccounts;
        });
      }

      return updatedTransactions;
    });
  };

  // 6. Handlers de Orçamentos (Budgets)
  const handleAddBudget = (category: string, limitAmount: number) => {
    const newBudget: Budget = {
      id: `b-${Date.now()}`,
      category,
      limitAmount,
      spentAmount: 0 // Será calculado ao vivo nos relatórios
    };
    saveBudgetsToStorage([...budgets, newBudget]);
  };

  const handleEditBudget = (id: string, limitAmount: number) => {
    const updated = budgets.map(b => b.id === id ? { ...b, limitAmount } : b);
    saveBudgetsToStorage(updated);
  };

  const handleDeleteBudget = (id: string) => {
    saveBudgetsToStorage(budgets.filter(b => b.id !== id));
    deleteFromCloud('budgets', id);
  };

  // 7. Handlers de Metas (Goals)
  const handleAddGoal = (g: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...g,
      id: `g-${Date.now()}`
    };
    saveGoalsToStorage([...goals, newGoal]);
  };

  const handleEditGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    saveGoalsToStorage(updated);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoalsToStorage(goals.filter(g => g.id !== id));
    deleteFromCloud('goals', id);
  };

  // 8. Open Finance Bank Sincronização Handlers
    const handleDisconnectBank = (bankCode: string) => {
    const updatedAccounts = accounts.map(acc => {
      if (acc.syncBankCode === bankCode) {
        return {
          ...acc,
          synced: false,
          lastSyncDate: undefined
        };
      }
      return acc;
    });

    // Opcionalmente podemos reter as transações já importadas ou limpá-las. Vamos mantê-las por segurança de histórico de gastos.
    saveAccountsToStorage(updatedAccounts);
  };

  // Ação rápida da dashboard para abrir lançamento direto na aba correspondente
  const handleAddTransactionClick = (type: 'income' | 'expense') => {
    setActiveAddModalType(type);
    setActiveTab('transactions');
  };

  const handleCompleteTour = () => {
    setShowTour(false);
    localStorage.setItem(getStorageKey('org_tour_completed'), 'true');
  };

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-transparent flex flex-col font-sans text-slate-100 relative`} id="organizze-app-root">
        <div className="bg-mesh"></div>
        <Login onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          setIsLoggedIn(true);
        }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-transparent flex flex-col font-sans text-slate-900 dark:text-slate-100 relative`} id="organizze-app-root">
      {/* Dynamic Ambient Background Mesh */}
      <div className="bg-mesh"></div>
      
      {/* HEADER PRINCIPAL SUPERIOR (Estilo Premium Organizze - Frosted Glass) */}
      <header className="glass sticky top-0 z-40 border-b border-slate-900/5 dark:border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/20 bg-[#040613] flex items-center justify-center shrink-0">
              <img 
                src={adonaxLogo} 
                alt="Adonax Finance" 
                className="w-full h-full object-cover scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                ADONAX <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">Finance</span> <span className="text-indigo-600 dark:text-indigo-300 font-bold text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-300 font-semibold tracking-wider uppercase opacity-80">Controle Financeiro Inteligente</p>
            </div>
          </div>

          {/* Perfil & Informações do Usuário */}
          <div className="flex items-center gap-3">
            {hasSupabaseConfig && user && user.id !== 'guest' && !user.id.startsWith('local-') && (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-900/10 dark:border-white/10 glass text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer disabled:opacity-60 text-slate-700 dark:text-slate-300 ${
                  isSyncing ? 'animate-pulse' : 'hover:bg-slate-900/5 dark:hover:bg-white/5'
                }`}
                title="Sincronizar dados com a Nuvem"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-teal-500 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>
            )}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 rounded-full glass hover:bg-slate-900/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-900/10 dark:border-white/10 cursor-pointer"
              title="Alternar Tema"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">{userName}</span>
              <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-semibold">{userEmail}</span>
            </div>
            <div 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 cursor-pointer border-2 border-slate-900/10 dark:border-white/10 flex items-center justify-center font-bold text-sm text-white transition-all active:scale-95 shadow-md shadow-indigo-500/15"
              title="Meu Perfil"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => {
                if (hasSupabaseConfig) {
                  supabase.auth.signOut();
                } else {
                  setUser(null);
                  setIsLoggedIn(false);
                }
              }}
              className="w-10 h-10 rounded-full glass hover:bg-slate-900/5 dark:hover:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors border border-slate-900/10 dark:border-white/10 cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* SUB-BARRA DE NAVEGAÇÃO / ABAS (Navegação Horizontal Rítmica) */}
      <nav className="glass sticky top-[64px] z-30 border-b border-slate-900/5 dark:border-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="flex space-x-1 sm:space-x-4 py-2 min-w-max">
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-dashboard"
            >
              <Wallet className="w-4 h-4" /> Visão Geral
            </button>

            <button 
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'transactions' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-transactions"
            >
              <ListOrdered className="w-4 h-4" /> Lançamentos
              {transactions.filter(t => t.date.startsWith(currentMonth) && t.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                  {transactions.filter(t => t.date.startsWith(currentMonth) && t.status === 'pending').length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'cards' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-cards"
            >
              <CreditCard className="w-4 h-4" /> Cartões
            </button>

            <button 
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'budgets' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-budgets"
            >
              <DollarSign className="w-4 h-4" /> Planejamento
            </button>

            <button 
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'goals' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-goals"
            >
              <PiggyBank className="w-4 h-4" /> Metas de Sonhos
            </button>

            <button 
              onClick={() => setActiveTab('accounts')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'accounts' 
                  ? 'glass-dark text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 dark:border-cyan-500/30 font-extrabold' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'
              }`}
              id="tab-accounts"
            >
              <Building className="w-4 h-4" /> Contas
            </button>

          </div>
        </div>
      </nav>

      {/* ÁREA DE CONTEÚDO DINÂMICO PRINCIPAL (Transições leves) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="focus:outline-none"
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                accounts={accounts}
                transactions={transactions}
                categories={categories}
                goals={goals}
                budgets={budgets}
                currentMonth={currentMonth}
                onAddTransactionClick={handleAddTransactionClick}
                onNavigateToTab={setActiveTab}
                onEditAccount={handleEditAccount}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsList 
                transactions={transactions}
                categories={categories}
                accounts={accounts}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onAddTransaction={handleAddTransaction}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                activeAddModalType={activeAddModalType}
                onCloseAddModal={() => setActiveAddModalType(null)}
              />
            )}

            {activeTab === 'cards' && (
              <CreditCards 
                accounts={accounts}
                transactions={transactions}
                categories={categories}
                cardInvoices={cardInvoices}
                currentMonth={currentMonth}
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
                onAddTransaction={handleAddTransaction}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateInvoice={handleUpdateInvoice}
              />
            )}

            {activeTab === 'budgets' && (
              <Budgets 
                budgets={budgets}
                categories={categories}
                transactions={transactions}
                accounts={accounts}
                currentMonth={currentMonth}
                onAddBudget={handleAddBudget}
                onEditBudget={handleEditBudget}
                onDeleteBudget={handleDeleteBudget}
              />
            )}

            {activeTab === 'goals' && (
              <Goals 
                goals={goals}
                onAddGoal={handleAddGoal}
                onEditGoal={handleEditGoal}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {activeTab === 'accounts' && (
              <AccountsManager 
                accounts={accounts}
                onAddAccount={handleAddAccount}
                onEditAccount={handleEditAccount}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === 'profile' && (
              <Profile 
                user={user}
                onUpdateUser={setUser}
                onLogout={() => {
                  setUser(null);
                  setIsLoggedIn(false);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* RODAPÉ INFORMATIVO */}
      <footer className="glass border-t border-slate-900/5 dark:border-white/5 py-5 text-slate-600 dark:text-slate-300 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:justify-between sm:items-center space-y-2.5 sm:space-y-0 text-xs text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            &copy; 2026 Adonax Finance PRO - Controle Financeiro Pessoal. Inspirado nas melhores práticas do mercado.
          </p>
          <div className="flex justify-center gap-4 font-bold text-teal-400/80">
            <a href="#" className="hover:text-teal-300 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-teal-300 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-teal-300 transition-colors">Ajuda & FAQ</a>
          </div>
        </div>
      </footer>

      {showTour && (
        <GuidedTour 
          categories={categories}
          accounts={accounts}
          onAddAccount={handleAddAccount}
          onAddTransaction={handleAddTransaction}
          onAddBudget={handleAddBudget}
          onAddGoal={handleAddGoal}
          onComplete={handleCompleteTour}
        />
      )}

    </div>
  );
}
