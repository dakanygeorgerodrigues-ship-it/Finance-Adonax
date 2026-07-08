/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Budget, Category, Transaction, Account } from '../types';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  PiggyBank,
  Edit2,
  X,
  PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Reports from './Reports';

interface BudgetsProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  accounts: Account[];
  currentMonth: string; // "YYYY-MM"
  onAddBudget: (category: string, limitAmount: number) => void;
  onEditBudget: (id: string, limitAmount: number) => void;
  onDeleteBudget: (id: string) => void;
}

export default function Budgets({
  budgets,
  categories,
  transactions,
  accounts,
  currentMonth,
  onAddBudget,
  onEditBudget,
  onDeleteBudget
}: BudgetsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState('');
  const [budgetToDelete, setBudgetToDelete] = useState<(Budget & { categoryName: string }) | null>(null);

  // Filtrar transações de despesa do mês atual
  const monthlyExpenses = transactions.filter(
    t => t.date.startsWith(currentMonth) && t.type === 'expense' && t.status === 'paid'
  );

  // Calcular despesa real para cada orçamento dinamicamente do mês atual
  const budgetsWithLiveSpending = budgets.map(b => {
    const liveSpent = monthlyExpenses
      .filter(t => t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      ...b,
      spentAmount: parseFloat(liveSpent.toFixed(2))
    };
  });

  // Filtrar categorias que já têm orçamento definido
  const budgetCategoryIds = budgets.map(b => b.category);
  const availableCategories = categories.filter(
    c => c.type === 'expense' && !budgetCategoryIds.includes(c.id)
  );

  const getCategoryDetails = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'Sem categoria', color: '#6B7280' };
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limitAmount) return;

    onAddBudget(selectedCategory, parseFloat(limitAmount));
    
    // Resetar
    setSelectedCategory('');
    setLimitAmount('');
    setIsOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editingLimit) return;
    onEditBudget(id, parseFloat(editingLimit));
    setEditingBudgetId(null);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho do Orçamento */}
      <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
            <PiggyBank className="w-5.5 h-5.5 text-teal-400" /> Planejamento de Orçamentos
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
            Defina limites de gastos mensais para categorias específicas. Acompanhe seus limites de perto para evitar surpresas no fim do mês!
          </p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          disabled={availableCategories.length === 0}
          className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-900/5 dark:bg-white/5 disabled:text-slate-500 text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
          id="open-add-budget-modal"
        >
          <Plus className="w-4.5 h-4.5" /> Criar Limite
        </button>
      </div>

      {/* Lista de Orçamentos Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetsWithLiveSpending.length === 0 ? (
          <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 col-span-2 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-bold text-slate-900 dark:text-white text-sm">Nenhum orçamento planejado</p>
            <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
              Clique no botão "Criar Limite" acima para começar a gerenciar seus tetos de despesas por categoria!
            </p>
          </div>
        ) : (
          budgetsWithLiveSpending.map(b => {
            const cat = getCategoryDetails(b.category);
            const percent = Math.min(100, Math.round((b.spentAmount / b.limitAmount) * 100));
            const isExceeded = b.spentAmount > b.limitAmount;
            const isWarning = b.spentAmount > b.limitAmount * 0.85 && b.spentAmount <= b.limitAmount;
            
            return (
              <motion.div 
                key={b.id}
                layout
                className="glass rounded-2xl border border-slate-900/5 dark:border-white/5 p-5 shadow-xl space-y-4 relative overflow-hidden"
              >
                {/* Linha Superior */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <span className="w-3.5 h-3.5 rounded-full block" style={{ backgroundColor: cat.color }}></span>
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-display">{cat.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Orçamento do Mês</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botão de Excluir */}
                    <button 
                      onClick={() => setBudgetToDelete({ ...b, categoryName: cat.name })}
                      className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Limite"
                      id={`delete-budget-btn-${b.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Linha de Valores */}
                {editingBudgetId === b.id ? (
                  <form onSubmit={(e) => handleSaveEdit(e, b.id)} className="flex gap-2 items-center">
                    <input 
                      type="number"
                      step="0.01"
                      required
                      placeholder="Novo Limite"
                      value={editingLimit}
                      onChange={e => setEditingLimit(e.target.value)}
                      className="w-full text-slate-900 dark:text-white text-xs font-semibold px-2.5 py-1.5 glass-input rounded-lg focus:outline-none"
                      id={`edit-budget-input-${b.id}`}
                    />
                    <button type="submit" className="text-xs text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-lg font-bold cursor-pointer">Salvar</button>
                    <button type="button" onClick={() => setEditingBudgetId(null)} className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 px-2 py-1.5 rounded-lg cursor-pointer">Cancelar</button>
                  </form>
                ) : (
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white font-display">{formatCurrency(b.spentAmount)}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">gasto de</span>
                    </div>
                    <div className="flex items-baseline gap-1 group">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(b.limitAmount)}</span>
                      <button 
                        onClick={() => {
                          setEditingBudgetId(b.id);
                          setEditingLimit(b.limitAmount.toString());
                        }}
                        className="text-teal-400 opacity-0 group-hover:opacity-100 hover:text-teal-300 p-0.5 rounded transition-all cursor-pointer"
                        title="Editar Limite"
                        id={`edit-budget-trigger-${b.id}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Barra de Progresso */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-900/10 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-teal-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">{percent}% utilizado</span>
                    <span className={`flex items-center gap-1 ${isExceeded ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-teal-300'}`}>
                      {isExceeded ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Estourado por {formatCurrency(b.spentAmount - b.limitAmount)}
                        </>
                      ) : isWarning ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" /> Alerta! Restam {formatCurrency(b.limitAmount - b.spentAmount)}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-teal-400" /> Restam {formatCurrency(b.limitAmount - b.spentAmount)}
                        </>
                      )}
                    </span>
                  </div>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* --- MODAL PARA CRIAR ORÇAMENTO --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-modal rounded-2xl shadow-2xl border border-white/15 w-full max-w-sm overflow-hidden"
              id="add-budget-modal"
            >
              <div className="p-6 border-b border-slate-900/10 dark:border-white/10 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5 font-display">
                  <PlusCircle className="w-5 h-5 text-teal-400" /> Novo Orçamento de Gastos
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
                
                {/* Selecionar Categoria */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Selecione a Categoria</label>
                  <select 
                    required
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full text-xs font-semibold glass-input px-3 py-2.5 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    id="new-budget-category-select"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-500 dark:text-slate-400">Escolha uma categoria de despesa</option>
                    {availableCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Limite de Gasto */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Limite Mensal Desejado (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="ex: 1200"
                    value={limitAmount}
                    onChange={e => setLimitAmount(e.target.value)}
                    className="w-full text-slate-900 dark:text-white text-sm font-bold px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="new-budget-limit-input"
                  />
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/10 dark:border-white/10">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center"
                    id="save-new-budget-btn"
                  >
                    Criar Limite
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE BUDGET MODAL */}
      <AnimatePresence>
        {budgetToDelete && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Excluir Orçamento</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tem certeza que deseja excluir o planejamento de orçamento para a categoria "{budgetToDelete.categoryName}"? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setBudgetToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteBudget(budgetToDelete.id);
                    setBudgetToDelete(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-rose-500/15"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Relatórios e Gráficos */}
      <div className="pt-8 border-t border-slate-900/5 dark:border-white/5">
        <Reports 
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          currentMonth={currentMonth}
        />
      </div>

    </div>
  );
}
