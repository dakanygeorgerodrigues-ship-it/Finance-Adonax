/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category, Account } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentMonth: string; // "YYYY-MM"
  onMonthChange: (month: string) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  activeAddModalType: 'income' | 'expense' | null;
  onCloseAddModal: () => void;
}

export default function TransactionsList({
  transactions,
  categories,
  accounts,
  currentMonth,
  onMonthChange,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onAddCategory,
  onDeleteCategory,
  activeAddModalType,
  onCloseAddModal
}: TransactionsListProps) {
  // Estados para pesquisa, filtros e formulários
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  
  // Seleção múltipla para ações em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Estados de Edição de Transação
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Estados do Modal de Cadastro Integrado (se ativado pelo botão externo ou interno)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addFormType, setAddFormType] = useState<'income' | 'expense'>('expense');
  const [newTx, setNewTx] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    account: accounts[0]?.id || '',
    status: 'paid' as 'paid' | 'pending'
  });

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');

  const [isDeleteCategoryOpen, setIsDeleteCategoryOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState('');

  // Sincronizar o modal externo com o estado interno do modal
  React.useEffect(() => {
    if (activeAddModalType) {
      setAddFormType(activeAddModalType);
      setNewTx(prev => ({
        ...prev,
        category: categories.find(c => c.type === activeAddModalType)?.id || '',
        account: accounts[0]?.id || ''
      }));
      setIsAddOpen(true);
    }
  }, [activeAddModalType, categories, accounts]);

  // Converter "YYYY-MM" para exibição elegante em Português
  const getMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[parseInt(month) - 1]} de ${year}`;
  };

  // Navegar entre meses
  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Filtragem de transações com base no mês e nos parâmetros de busca
  const filteredTransactions = transactions.filter(t => {
    // 1. Filtro por mês
    if (!t.date.startsWith(currentMonth)) return false;

    // 2. Filtro por pesquisa
    if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // 3. Filtro por tipo
    if (filterType !== 'all' && t.type !== filterType) return false;

    // 4. Filtro por categoria
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;

    // 5. Filtro por conta
    if (filterAccount !== 'all' && t.account !== filterAccount) return false;

    // 6. Filtro por status
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;

    return true;
  });

  // Obter detalhes visuais da categoria
  const getCategoryDetails = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'Sem categoria', color: '#6B7280', icon: 'HelpCircle' };
  };

  // Obter detalhes visuais da conta
  const getAccountName = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'Conta desconhecida';
  };

  // Adição de transação
  const handleSaveNewTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.description.trim() || !newTx.amount || !newTx.category) return;

    onAddTransaction({
      description: newTx.description.trim(),
      amount: parseFloat(newTx.amount),
      type: addFormType,
      category: newTx.category,
      date: newTx.date,
      account: newTx.account,
      status: newTx.status,
      isSynced: false
    });

    // Resetar estado
    setNewTx({
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      account: accounts[0]?.id || '',
      status: 'paid'
    });
    setIsAddOpen(false);
    onCloseAddModal();
  };

  // Salvamento de edição
  const handleSaveEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !editingTransaction.description.trim() || !editingTransaction.amount) return;

    onEditTransaction(editingTransaction.id, {
      description: editingTransaction.description.trim(),
      amount: editingTransaction.amount,
      category: editingTransaction.category,
      date: editingTransaction.date,
      account: editingTransaction.account,
      status: editingTransaction.status
    });

    setEditingTransaction(null);
  };

  // Toggle de status rápido (pago/pendente)
  const handleToggleStatus = (t: Transaction) => {
    onEditTransaction(t.id, {
      status: t.status === 'paid' ? 'pending' : 'paid'
    });
  };

  // Seleção em lote
  const handleSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  // Ações em lote
  const handleBulkDelete = () => {
    setIsBulkDeleteOpen(true);
  };

  const handleBulkMarkAsPaid = () => {
    selectedIds.forEach(id => onEditTransaction(id, { status: 'paid' }));
    setSelectedIds([]);
  };

  // Exportar dados para CSV
  const handleExportCSV = () => {
    const headers = ['Descrição', 'Valor', 'Tipo', 'Categoria', 'Data', 'Conta', 'Situação'];
    const rows = filteredTransactions.map(t => [
      t.description,
      t.amount,
      t.type === 'income' ? 'Receita' : 'Despesa',
      getCategoryDetails(t.category).name,
      t.date,
      getAccountName(t.account),
      t.status === 'paid' ? 'Pago' : 'Pendente'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `organizze_relatorio_${currentMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Navegador de Mês Elegante (Estilo Organizze - Glassmorphism) */}
      <div className="glass rounded-2xl border border-slate-900/5 dark:border-white/5 p-4 shadow-xl flex items-center justify-between">
        <button 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-900/10 dark:bg-white/10 border border-slate-900/5 dark:border-white/5 rounded-xl transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
          id="prev-month-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-slate-900 dark:text-white text-sm md:text-base tracking-tight select-none font-display">
          {getMonthLabel(currentMonth)}
        </span>
        <button 
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-900/10 dark:bg-white/10 border border-slate-900/5 dark:border-white/5 rounded-xl transition-colors text-slate-600 dark:text-slate-300 cursor-pointer"
          id="next-month-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Caixa de Ferramentas, Busca e Filtros */}
      <div className="glass rounded-2xl border border-slate-900/5 dark:border-white/5 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Barra de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 dark:text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar lançamentos..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all"
              id="tx-search-input"
            />
          </div>

          {/* Botão de Exportar */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 border border-slate-900/10 dark:border-white/10 hover:border-slate-900/20 dark:border-white/20 text-slate-700 dark:text-slate-200 glass glass-hover transition-colors px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            id="tx-export-csv-btn"
          >
            <FileSpreadsheet className="w-4 h-4 text-teal-400" /> Exportar CSV
          </button>

          {/* Botão Nova Transação */}
          <button 
            onClick={() => {
              setAddFormType('expense');
              setNewTx(prev => ({
                ...prev,
                category: categories.find(c => c.type === 'expense')?.id || '',
                account: accounts[0]?.id || ''
              }));
              setIsAddOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-500 text-slate-900 dark:text-white font-extrabold flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-teal-500/20"
            id="add-transaction-btn"
          >
            <Plus className="w-4.5 h-4.5" /> Novo Lançamento
          </button>
        </div>

        {/* Linha de Filtros Compacta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-900/5 dark:border-white/5">
          
          {/* Tipo de Transação */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">Tipo</label>
            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              id="filter-type-select"
            >
              <option value="all" className="bg-slate-900 text-slate-900 dark:text-white">Todos os tipos</option>
              <option value="income" className="bg-slate-900 text-slate-900 dark:text-white">Apenas Receitas</option>
              <option value="expense" className="bg-slate-900 text-slate-900 dark:text-white">Apenas Despesas</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">Categoria</label>
            <select 
              value={filterCategory}
              onChange={e => {
                if (e.target.value === '__NEW__') {
                  setIsAddCategoryOpen(true);
                } else if (e.target.value === '__DELETE__') {
                  setIsDeleteCategoryOpen(true);
                } else {
                  setFilterCategory(e.target.value);
                }
              }}
              className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              id="filter-category-select"
            >
              <option value="all" className="bg-slate-900 text-slate-900 dark:text-white">Todas as categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
              ))}
              <option value="__NEW__" className="bg-slate-900 font-bold text-teal-400">+ Nova categoria...</option>
              <option value="__DELETE__" className="bg-slate-900 font-bold text-rose-400">- Excluir categorias...</option>
            </select>
          </div>

          {/* Conta de Destino */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">Conta/Cartão</label>
            <select 
              value={filterAccount}
              onChange={e => setFilterAccount(e.target.value)}
              className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              id="filter-account-select"
            >
              <option value="all" className="bg-slate-900 text-slate-900 dark:text-white">Todas as contas</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id} className="bg-slate-900 text-slate-900 dark:text-white">{a.name}</option>
              ))}
            </select>
          </div>

          {/* Situação */}
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 block mb-1">Situação</label>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-lg text-slate-100 focus:outline-none focus:border-teal-500"
              id="filter-status-select"
            >
              <option value="all" className="bg-slate-900 text-slate-900 dark:text-white">Qualquer situação</option>
              <option value="paid" className="bg-slate-900 text-slate-900 dark:text-white">Pago / Recebido</option>
              <option value="pending" className="bg-slate-900 text-slate-900 dark:text-white">Pendente</option>
            </select>
          </div>

        </div>
      </div>

      {/* Caixa de Ações em Lote */}
      {selectedIds.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-teal-500/30 p-4 rounded-xl flex items-center justify-between shadow-lg"
          id="bulk-actions-banner"
        >
          <span className="text-teal-300 text-xs font-bold">
            {selectedIds.length} item(ns) selecionado(s)
          </span>
          <div className="flex gap-2">
            <button 
              onClick={handleBulkMarkAsPaid}
              className="text-xs text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
              id="bulk-mark-paid-btn"
            >
              <Check className="w-3.5 h-3.5" /> Conciliar (Marcar Pago)
            </button>
            <button 
              onClick={handleBulkDelete}
              className="text-xs text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
              id="bulk-delete-btn"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir Selecionados
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white px-2 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
              id="cancel-bulk-selection-btn"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabela de Lançamentos */}
      <div className="glass rounded-2xl border border-slate-900/5 dark:border-white/5 shadow-xl overflow-hidden">
        
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto animate-bounce" />
            <p className="font-extrabold text-slate-900 dark:text-white text-sm font-display">Nenhum lançamento encontrado</p>
            <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-500 dark:text-slate-400">
              Tente alterar os filtros ou adicione uma nova transação para o mês selecionado.
            </p>
          </div>
        ) : (
          
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">

              <thead>
                <tr className="bg-slate-900/5 dark:bg-white/5 border-b border-slate-900/5 dark:border-white/5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
                      id="select-all-transactions-checkbox"
                    />
                  </th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Data</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Lançamento / Categoria</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Conta / Destino</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap">Situação</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">Valor</th>
                  <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/5 dark:divide-white/5">
                {filteredTransactions.map(t => {
                  const category = getCategoryDetails(t.category);
                  const isExpense = t.type === 'expense';
                  const isSelected = selectedIds.includes(t.id);
                  
                  return (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-slate-900/5 dark:bg-white/5 transition-all duration-150 ${isSelected ? 'bg-teal-500/10' : ''}`}
                    >
                      {/* Checkbox de Seleção */}
                      <td className="py-3.5 px-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectToggle(t.id)}
                          className="rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4"
                          id={`tx-checkbox-${t.id}`}
                        />
                      </td>

                      {/* Data formatada DD/MM */}
                      <td className="py-3.5 px-3 text-xs text-slate-500 dark:text-slate-400 font-bold font-mono whitespace-nowrap">
                        {t.date.split('-').slice(1, 3).reverse().join('/')}
                      </td>

                      {/* Descrição e Categoria com Mini Badge */}
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
                          {t.description}
                          
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span 
                            className="w-2 h-2 rounded-full block"
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {category.name}
                          </span>
                        </div>
                      </td>

                      {/* Conta */}
                      <td className="py-3.5 px-3 text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                        {getAccountName(t.account)}
                      </td>

                      {/* Situação pago/pendente interativo */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleToggleStatus(t)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                            t.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title={t.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                          id={`toggle-status-btn-${t.id}`}
                        >
                          {t.status === 'paid' ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Valor em BRL */}
                      <td className={`py-3.5 px-3 text-right font-extrabold text-xs sm:text-sm font-display whitespace-nowrap ${isExpense ? 'text-rose-400' : 'text-teal-300'}`}>
                        {isExpense ? '-' : '+'}
                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>

                      {/* Ações (Editar, Excluir) */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingTransaction(t)}
                            className="p-1.5 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
                            title="Editar"
                            id={`edit-tx-btn-${t.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setTransactionToDelete(t.id)}
                            className="p-1.5 hover:bg-rose-500/15 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Excluir"
                            id={`delete-tx-btn-${t.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            
              </table>
            </div>
            
            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-900/5 dark:divide-white/5">
              {filteredTransactions.map(t => {
                const category = getCategoryDetails(t.category);
                const isExpense = t.type === 'expense';
                const isSelected = selectedIds.includes(t.id);
                
                return (
                  <div key={t.id} className={`p-4 transition-all duration-150 ${isSelected ? 'bg-teal-500/10' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectToggle(t.id)}
                          className="rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4 mt-1"
                          id={`tx-mobile-checkbox-${t.id}`}
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {t.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                              {t.date.split('-').slice(1, 3).reverse().join('/')}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                              {getAccountName(t.account)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-right font-extrabold text-sm font-display whitespace-nowrap ${isExpense ? 'text-rose-400' : 'text-teal-300'}`}>
                        {isExpense ? '-' : '+'}
                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pl-7">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full block"
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">
                          {category.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleToggleStatus(t)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all border ${
                            t.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {t.status === 'paid' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Pago</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pendente</span>
                            </>
                          )}
                        </button>
                        
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setEditingTransaction(t)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setTransactionToDelete(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        )}
      </div>

      {/* --- MODAL INTEGRADO DE CADASTRO DE LANÇAMENTO --- */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-modal rounded-2xl w-full max-w-md overflow-hidden border border-white/12"
              id="add-tx-modal"
            >
              {/* Cabeçalho do modal */}
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
                  {addFormType === 'income' ? (
                    <>
                      <ArrowUpRight className="w-5.5 h-5.5 text-emerald-400 bg-emerald-500/15 rounded-full p-0.5" />
                      <span>Nova Receita</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-5.5 h-5.5 text-rose-400 bg-rose-500/15 rounded-full p-0.5" />
                      <span>Nova Despesa</span>
                    </>
                  )}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddOpen(false);
                    onCloseAddModal();
                  }}
                  className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSaveNewTransaction} className="p-6 space-y-4">
                
                {/* Abas Alternadoras no modal */}
                <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => {
                      setAddFormType('expense');
                      setNewTx(prev => ({
                        ...prev,
                        category: categories.find(c => c.type === 'expense')?.id || ''
                      }));
                    }}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      addFormType === 'expense' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    Despesa
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setAddFormType('income');
                      setNewTx(prev => ({
                        ...prev,
                        category: categories.find(c => c.type === 'income')?.id || ''
                      }));
                    }}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      addFormType === 'income' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white'
                    }`}
                  >
                    Receita
                  </button>
                </div>

                {/* Valor */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={newTx.amount}
                    onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full text-lg font-bold px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="new-tx-amount"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Descrição</label>
                  <input 
                    type="text"
                    required
                    maxLength={100}
                    placeholder="ex: Mercado, Combustível..."
                    value={newTx.description}
                    onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                    className="w-full text-sm font-medium px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="new-tx-desc"
                  />
                </div>

                {/* Grid Duplo: Categoria e Conta */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Categoria */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Categoria</label>
                    <select 
                      required
                      value={newTx.category}
                      onChange={e => {
                        if (e.target.value === '__NEW__') {
                          setIsAddCategoryOpen(true);
                        } else if (e.target.value === '__DELETE__') {
                          setIsDeleteCategoryOpen(true);
                        } else {
                          setNewTx({ ...newTx, category: e.target.value });
                        }
                      }}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="new-tx-category"
                    >
                      <option value="" disabled className="bg-slate-900">Selecionar</option>
                      {categories.filter(c => c.type === addFormType).map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                      <option value="__NEW__" className="bg-slate-900 font-bold text-teal-400">+ Nova categoria...</option>
                      <option value="__DELETE__" className="bg-slate-900 font-bold text-rose-400">- Excluir categorias...</option>
                    </select>
                  </div>

                  {/* Conta de Destino */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Conta / Destino</label>
                    <select 
                      required
                      value={newTx.account}
                      onChange={e => setNewTx({ ...newTx, account: e.target.value })}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="new-tx-account"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Duplo: Data e Situação */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Data */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data</label>
                    <input 
                      type="date"
                      required
                      value={newTx.date}
                      onChange={e => setNewTx({ ...newTx, date: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 glass-input rounded-xl focus:outline-none"
                      id="new-tx-date"
                    />
                  </div>

                  {/* Situação */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Situação</label>
                    <select 
                      value={newTx.status}
                      onChange={e => setNewTx({ ...newTx, status: e.target.value as any })}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="new-tx-status"
                    >
                      <option value="paid" className="bg-slate-900">{addFormType === 'income' ? 'Recebido' : 'Pago'}</option>
                      <option value="pending" className="bg-slate-900">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Ações do Modal */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddOpen(false);
                      onCloseAddModal();
                    }}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="save-new-tx-btn"
                  >
                    Salvar
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL DE EDIÇÃO DE LANÇAMENTO --- */}
      <AnimatePresence>
        {editingTransaction && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-md overflow-hidden border border-white/12"
              id="edit-tx-modal"
            >
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-display">
                  Editar Lançamento
                </h3>
                <button 
                  onClick={() => setEditingTransaction(null)}
                  className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditTransaction} className="p-6 space-y-4">
                
                {/* Valor */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Valor (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editingTransaction.amount}
                    onChange={e => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full text-lg font-bold px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="edit-tx-amount"
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Descrição</label>
                  <input 
                    type="text"
                    required
                    value={editingTransaction.description}
                    onChange={e => setEditingTransaction({ ...editingTransaction, description: e.target.value })}
                    className="w-full text-sm font-medium px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="edit-tx-desc"
                  />
                </div>

                {/* Grid Duplo */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Categoria */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Categoria</label>
                    <select 
                      required
                      value={editingTransaction.category}
                      onChange={e => {
                        if (e.target.value === '__NEW__') {
                          setIsAddCategoryOpen(true);
                        } else if (e.target.value === '__DELETE__') {
                          setIsDeleteCategoryOpen(true);
                        } else {
                          setEditingTransaction({ ...editingTransaction, category: e.target.value });
                        }
                      }}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="edit-tx-category"
                    >
                      {categories.filter(c => c.type === editingTransaction.type).map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                      ))}
                      <option value="__NEW__" className="bg-slate-900 font-bold text-teal-400">+ Nova categoria...</option>
                      <option value="__DELETE__" className="bg-slate-900 font-bold text-rose-400">- Excluir categorias...</option>
                    </select>
                  </div>

                  {/* Conta */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Conta / Destino</label>
                    <select 
                      required
                      value={editingTransaction.account}
                      onChange={e => setEditingTransaction({ ...editingTransaction, account: e.target.value })}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="edit-tx-account"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id} className="bg-slate-900">{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Duplo */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Data */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data</label>
                    <input 
                      type="date"
                      required
                      value={editingTransaction.date}
                      onChange={e => setEditingTransaction({ ...editingTransaction, date: e.target.value })}
                      className="w-full text-xs font-semibold px-3 py-2 glass-input rounded-xl focus:outline-none"
                      id="edit-tx-date"
                    />
                  </div>

                  {/* Situação */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Situação</label>
                    <select 
                      value={editingTransaction.status}
                      onChange={e => setEditingTransaction({ ...editingTransaction, status: e.target.value as any })}
                      className="w-full text-xs font-semibold glass-input px-3 py-2 rounded-xl focus:outline-none"
                      id="edit-tx-status"
                    >
                      <option value="paid" className="bg-slate-900">{editingTransaction.type === 'income' ? 'Recebido' : 'Pago'}</option>
                      <option value="pending" className="bg-slate-900">Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Botões do Modal */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="save-edit-tx-btn"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM SINGLE DELETE TRANSACTION MODAL */}
      <AnimatePresence>
        {transactionToDelete && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Confirmar Exclusão</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tem certeza que deseja excluir este lançamento permanentemente? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setTransactionToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteTransaction(transactionToDelete);
                    setTransactionToDelete(null);
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

      {/* CONFIRM BULK DELETE TRANSACTIONS MODAL */}
      <AnimatePresence>
        {isBulkDeleteOpen && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Excluir Selecionados</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Deseja realmente excluir as {selectedIds.length} transações selecionadas permanentemente? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(false)}
                  className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    selectedIds.forEach(id => onDeleteTransaction(id));
                    setSelectedIds([]);
                    setIsBulkDeleteOpen(false);
                  }}
                  className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-rose-500/15"
                >
                  Excluir Todas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CATEGORY MODAL */}
      <AnimatePresence>
        {isDeleteCategoryOpen && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
            >
              <div className="p-5 border-b border-slate-900/10 dark:border-white/10 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Excluir Categoria</h3>
                <button onClick={() => setIsDeleteCategoryOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Selecione a categoria para excluir</label>
                  <select 
                    value={categoryToDelete}
                    onChange={e => setCategoryToDelete(e.target.value)}
                    className="w-full text-sm font-medium px-3 py-2 glass-input rounded-xl focus:outline-none"
                  >
                    <option value="" disabled className="bg-slate-900">Selecionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="button"
                    disabled={!categoryToDelete}
                    onClick={() => {
                      if (categoryToDelete) {
                         if (window.confirm('Tem certeza que deseja excluir esta categoria? Ela não será removida das transações já criadas.')) {
                           onDeleteCategory(categoryToDelete);
                           setCategoryToDelete('');
                           setIsDeleteCategoryOpen(false);
                         }
                      }
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Excluir Categoria
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CATEGORY MODAL */}
      <AnimatePresence>
        {isAddCategoryOpen && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
            >
              <div className="p-5 border-b border-slate-900/10 dark:border-white/10 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Nova Categoria</h3>
                <button onClick={() => setIsAddCategoryOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newCategoryName.trim()) {
                  onAddCategory({
                    name: newCategoryName.trim(),
                    type: newCategoryType,
                    color: "text-teal-400",
                    icon: "HelpCircle"
                  });
                  setNewCategoryName("");
                  setIsAddCategoryOpen(false);
                }
              }} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl">
                  <button 
                    type="button" 
                    onClick={() => setNewCategoryType('expense')}
                    className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${newCategoryType === 'expense' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'}`}
                  >
                    Despesa
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewCategoryType('income')}
                    className={`text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${newCategoryType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-900/5 dark:bg-white/5'}`}
                  >
                    Receita
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nome da categoria</label>
                  <input 
                    type="text"
                    required
                    maxLength={30}
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full text-sm font-medium px-3 py-2 glass-input rounded-xl focus:outline-none"
                    placeholder="ex: Viagens"
                    autoFocus
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-slate-900 dark:text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Salvar Categoria
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
