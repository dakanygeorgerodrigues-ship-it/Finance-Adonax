/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account, Transaction, Category, Goal, Budget } from '../types';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Coins, 
  Smartphone, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ChevronRight, 
  AlertCircle,
  RefreshCw,
  Sparkles,
  DollarSign,
  Pencil,
  Check,
  X,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import AIFinancialTip from './AIFinancialTip';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  budgets: Budget[];
  currentMonth: string; // "YYYY-MM"
  onAddTransactionClick: (type: 'income' | 'expense') => void;
  onNavigateToTab: (tab: string) => void;
  onEditAccount: (id: string, updates: Partial<Account>) => void;
}

export default function Dashboard({
  accounts,
  transactions,
  categories,
  goals,
  budgets,
  currentMonth,
  onAddTransactionClick,
  onNavigateToTab,
  onEditAccount
}: DashboardProps) {
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  const today = new Date().toISOString().split('T')[0];
  const pendingTransactions = transactions.filter(t => t.status === 'pending' && t.date <= today);

  // Estado para Edição do Saldo Atual
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState<boolean>(false);
  const [tempBalances, setTempBalances] = useState<Record<string, string>>({});
  const [focusAccountId, setFocusAccountId] = useState<string | null>(null);

  const handleOpenEditBalance = (highlightAccountId?: string) => {
    const initialTempBalances: Record<string, string> = {};
    accounts.forEach(acc => {
      initialTempBalances[acc.id] = acc.balance.toString();
    });
    setTempBalances(initialTempBalances);
    setFocusAccountId(highlightAccountId || null);
    setIsEditBalanceOpen(true);
  };

  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(tempBalances).forEach(([accId, valStr]) => {
      const parsed = parseFloat(valStr as string);
      if (!isNaN(parsed)) {
        const acc = accounts.find(a => a.id === accId);
        if (acc && acc.type !== 'credit_card' && acc.balance !== parsed) {
          onEditAccount(accId, { balance: parsed });
        }
      }
    });
    setIsEditBalanceOpen(false);
  };

  // Filtrar transações do mês selecionado
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  // Calcular receitas, despesas e saldo do mês
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  // Saldo total de todas as contas (exceto cartões de crédito)
  const totalBalance = accounts.reduce((sum, acc) => {
    if (acc.type === 'credit_card') {
      return sum;
    }
    return sum + acc.balance;
  }, 0);

  // Formatar moeda brasileira
  const formatCurrency = (value: number) => {
    if (hideBalance) return 'R$ ••••••';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getAccountIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      default: return <Coins className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {pendingTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <h3 className="font-bold text-sm text-amber-400">Atenção: Transações Pendentes</h3>
            <p className="text-xs mt-1 opacity-90">
              Você possui {pendingTransactions.length} transaç{pendingTransactions.length === 1 ? 'ão' : 'ões'} pendente{pendingTransactions.length === 1 ? '' : 's'} com vencimento para hoje ou atrasada{pendingTransactions.length === 1 ? '' : 's'}.
            </p>
          </div>
          <button 
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Verificar
          </button>
        </motion.div>
      )}

      {/* Resumo do Saldo Principal (Estilo Organizze - Glassmorphism) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10 backdrop-blur-xl border border-indigo-500/20 text-slate-900 dark:text-white rounded-2xl p-6 shadow-xl relative overflow-hidden"
        id="dashboard-main-card"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
          <Sparkles className="w-40 h-40 text-indigo-400" />
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <p className="text-indigo-600 dark:text-cyan-300 text-xs font-bold tracking-wider uppercase opacity-90">SALDO ATUAL</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight select-all font-display ${totalBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-400'}`}>
              {formatCurrency(totalBalance)}
            </h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleOpenEditBalance()}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 transition-colors px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm cursor-pointer flex items-center gap-1.5"
              id="open-edit-balances-btn"
            >
              <Pencil className="w-3.5 h-3.5" /> Ajustar Saldo
            </button>
            <button 
              onClick={() => setHideBalance(!hideBalance)}
              className="bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:bg-white/20 border border-slate-900/10 dark:border-white/10 transition-colors px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-sm cursor-pointer"
              id="toggle-balance-visibility-btn"
            >
              {hideBalance ? 'Mostrar' : 'Ocultar'}
            </button>
          </div>
        </div>

        {/* Três pilares de fluxo de caixa (Estilo Organizze) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-900/10 dark:border-white/10 text-center">
          <div className="sm:border-r border-slate-900/10 dark:border-white/10 pb-4 sm:pb-0 border-b sm:border-b-0 border-slate-900/10 dark:border-white/10">
            <p className="text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> RECEITAS (MÊS)
            </p>
            <p className="text-base sm:text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 select-all font-display">
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
          <div className="sm:border-r border-slate-900/10 dark:border-white/10 pb-4 sm:pb-0 border-b sm:border-b-0 border-slate-900/10 dark:border-white/10">
            <p className="text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> DESPESAS (MÊS)
            </p>
            <p className="text-base sm:text-xl font-extrabold mt-1 text-rose-600 dark:text-rose-400 select-all font-display">
              {formatCurrency(monthlyExpense)}
            </p>
          </div>
          <div>
            <p className="text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
              <Coins className="w-3.5 h-3.5 text-adonax-gold" /> BALANÇO MENSAL
            </p>
            <p className="text-base sm:text-xl font-black mt-1 select-all font-display text-slate-900 dark:text-white">
              {formatCurrency(monthlyBalance)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Atalhos de Ação Rápida */}
      <div className="grid grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddTransactionClick('expense')}
          className="glass glass-hover text-rose-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border border-slate-900/10 dark:border-white/10 group"
          id="quick-add-expense-btn"
        >
          <div className="bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500/25 p-2.5 rounded-full mb-2 transition-colors">
            <ArrowDownRight className="w-6 h-6 text-rose-400" />
          </div>
          <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Nova Despesa</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddTransactionClick('income')}
          className="glass glass-hover text-emerald-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border border-slate-900/10 dark:border-white/10 group"
          id="quick-add-income-btn"
        >
          <div className="bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/25 p-2.5 rounded-full mb-2 transition-colors">
            <ArrowUpRight className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Nova Receita</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigateToTab('budgets')}
          className="glass glass-hover text-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all border border-slate-900/10 dark:border-white/10 group"
          id="quick-view-reports-btn"
        >
          <div className="bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/25 p-2.5 rounded-full mb-2 transition-colors">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Ver Gráficos</span>
        </motion.button>
      </div>

      {/* Contas & Cartões e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lado Esquerdo: Lista de Contas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-900/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Minhas Contas</h3>
              <button 
                onClick={() => onNavigateToTab('accounts')} 
                className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 group cursor-pointer"
                id="view-all-accounts-btn"
              >
                Gerenciar Conexões <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="divide-y divide-slate-900/5 dark:divide-white/5">
              {accounts.filter(a => a.type !== 'credit_card').map(acc => (
                <div key={acc.id} className="py-3.5 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-xl text-slate-900 dark:text-white flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: acc.color }}
                    >
                      {getAccountIcon(acc.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">{acc.name}</span>
                        {acc.synced && (
                          <span className="bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                            Sincronizado
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                        {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Dinheiro Físico'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm font-display ${acc.balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-400'}`}>
                      {formatCurrency(acc.balance)}
                    </span>
                    <button
                      onClick={() => handleOpenEditBalance(acc.id)}
                      className="text-slate-500 dark:text-slate-400 hover:text-teal-400 p-1.5 rounded-lg hover:bg-slate-900/5 dark:bg-white/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100 flex items-center justify-center border border-transparent hover:border-slate-900/10 dark:border-white/10"
                      title="Ajustar Saldo"
                      id={`edit-balance-btn-${acc.id}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cartões de Crédito */}
          <div className="glass rounded-2xl p-6 border border-slate-900/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Cartões de Crédito</h3>
            </div>

            <div className="space-y-4">
              {accounts.filter(a => a.type === 'credit_card').map(card => {
                const creditLimit = card.creditLimit || 1;
                const creditUsed = Math.abs(card.balance);
                const percentUsed = Math.min(100, Math.round((creditUsed / creditLimit) * 100));
                
                return (
                  <div key={card.id} className="p-4 glass-dark rounded-xl border border-slate-900/5 dark:border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2.5 rounded-xl text-slate-900 dark:text-white flex items-center justify-center"
                          style={{ backgroundColor: card.color }}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white block">{card.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Fatura Atual</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-slate-900 dark:text-white block font-display">{formatCurrency(creditUsed)}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Limite total: {formatCurrency(creditLimit)}</span>
                      </div>
                    </div>

                    {/* Barra de Progresso do Limite */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>{percentUsed}% do limite utilizado</span>
                        <span>Disponível: {formatCurrency(creditLimit - creditUsed)}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-teal-400'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lado Direito: Metas & Avisos Rápidos */}
        <div className="space-y-6">
          {/* Metas Financeiras */}
          <div className="glass rounded-2xl p-6 border border-slate-900/5 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 font-display">
                <PiggyBank className="w-5 h-5 text-teal-400" /> Minhas Metas
              </h3>
              <button 
                onClick={() => onNavigateToTab('goals')} 
                className="text-xs text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                id="manage-goals-btn"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map(goal => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-200">{goal.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatCurrency(goal.currentAmount)} salvos</span>
                      <span>Meta: {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dicas Organizze (Finanças Inteligentes) */}
          <div className="glass rounded-2xl border border-teal-500/20 p-5 space-y-3 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-teal-500/5 rounded-full blur-xl"></div>
            <h4 className="font-bold text-teal-300 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-teal-400" /> Dica de Finanças
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Mantenha seus lançamentos sempre categorizados para ter um controle mais preciso de onde seu dinheiro está indo. Revise suas despesas regularmente na aba de Transações!
            </p>
            <div className="flex gap-2 pt-1">
              <button 
                onClick={() => onNavigateToTab('transactions')} 
                className="text-xs text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 border border-teal-500/20 font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-lg shadow-teal-500/10"
                id="review-syncs-btn"
              >
                Ver Lançamentos
              </button>
            </div>
          </div>
          
          <AIFinancialTip 
            transactions={transactions} 
            budgets={budgets} 
            goals={goals} 
          />
        </div>

      </div>

      {/* BALANCES EDIT MODAL */}
      <AnimatePresence>
        {isEditBalanceOpen && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-md overflow-hidden border border-white/12 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-900/10 dark:border-white/10">
                <div className="flex items-center gap-2.5 text-teal-400">
                  <Wallet className="w-5 h-5 shrink-0" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Ajustar Saldo das Contas</h3>
                </div>
                <button 
                  onClick={() => setIsEditBalanceOpen(false)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white p-1 rounded-lg hover:bg-slate-900/5 dark:bg-white/5 transition-colors cursor-pointer"
                  id="close-edit-balances-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBalances} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ajuste o saldo atual de suas contas abaixo.
                </p>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {accounts.filter(a => a.type !== 'credit_card').map(acc => {
                    const isFocused = focusAccountId === acc.id;
                    return (
                      <div 
                        key={acc.id} 
                        className={`p-3.5 rounded-xl border transition-all ${
                          isFocused 
                            ? 'bg-teal-500/10 border-teal-500/35' 
                            : 'bg-slate-900/5 dark:bg-white/5 border-slate-900/5 dark:border-white/5 hover:border-slate-900/10 dark:border-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-8 h-8 rounded-lg text-slate-900 dark:text-white flex items-center justify-center shrink-0"
                              style={{ backgroundColor: acc.color }}
                            >
                              {getAccountIcon(acc.icon)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-xs text-slate-100 block truncate">{acc.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block capitalize">
                                {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Dinheiro Físico'}
                              </span>
                            </div>
                          </div>

                          <div className="relative shrink-0 w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">R$</span>
                            <input 
                              type="number"
                              step="0.01"
                              autoFocus={isFocused}
                              value={tempBalances[acc.id] ?? ''}
                              onChange={(e) => setTempBalances(prev => ({
                                ...prev,
                                [acc.id]: e.target.value
                              }))}
                              className="w-full bg-slate-950/50 border border-slate-900/10 dark:border-white/10 focus:border-teal-500 rounded-lg pl-8 pr-3 py-1.5 text-right font-bold text-xs text-slate-100 focus:outline-none transition-colors font-mono"
                              placeholder="0,00"
                              id={`input-balance-${acc.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Nota explicativa para cartões de crédito se houver */}
                  {accounts.some(a => a.type === 'credit_card') && (
                    <div className="bg-slate-900/5 dark:bg-white/5 rounded-xl p-3 border border-slate-900/5 dark:border-white/5 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        <strong>Nota:</strong> O saldo dos cartões de crédito é calculado automaticamente com base em suas faturas e lançamentos, portanto não precisa ser editado manualmente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Resumo da Mudança do Saldo Atual */}
                <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/15 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span>Saldo Atual:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(totalBalance)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-900 dark:text-white">
                    <span className="font-bold">Novo Saldo Atual Estimado:</span>
                    <span className="font-black text-teal-300 font-mono">
                      {formatCurrency(
                        Object.entries(tempBalances).reduce((sum, [accId, valStr]) => {
                          const parsed = parseFloat(valStr as string) || 0;
                          const acc = accounts.find(a => a.id === accId);
                          if (!acc || acc.type === 'credit_card') return sum;
                          return sum + parsed;
                        }, 0)
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditBalanceOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/15"
                  >
                    Salvar Ajustes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
