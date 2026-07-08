/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Account, Transaction, Category, CardInvoice } from '../types';
import { 
  CreditCard, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  PlusCircle, 
  HelpCircle, 
  AlertTriangle,
  Wallet,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreditCardsProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  cardInvoices: CardInvoice[];
  currentMonth: string; // "YYYY-MM"
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onEditAccount: (id: string, updates: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateInvoice: (invoice: CardInvoice) => void;
}

export default function CreditCards({
  accounts,
  transactions,
  categories,
  cardInvoices,
  currentMonth,
  onAddAccount,
  onEditAccount,
  onDeleteAccount,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onUpdateInvoice
}: CreditCardsProps) {
  // Filter only credit cards
  const creditCards = accounts.filter(a => a.type === 'credit_card');

  // Selected card state (default to first card, or null if none)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    creditCards.length > 0 ? creditCards[0].id : null
  );

  // If selected card was deleted, fall back to first available
  useEffect(() => {
    if (selectedCardId && !accounts.some(a => a.id === selectedCardId && a.type === 'credit_card')) {
      setSelectedCardId(creditCards.length > 0 ? creditCards[0].id : null);
    } else if (!selectedCardId && creditCards.length > 0) {
      setSelectedCardId(creditCards[0].id);
    }
  }, [accounts, creditCards, selectedCardId]);

  // Selected month state (default to currentMonth from app)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // Modals / forms state
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState<boolean>(false);
  const [isPayInvoiceOpen, setIsPayInvoiceOpen] = useState<boolean>(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState<boolean>(false);

  // Card creator form state
  const [newCardName, setNewCardName] = useState<string>('');
  const [newCardLimit, setNewCardLimit] = useState<string>('');
  const [newCardColor, setNewCardColor] = useState<string>('#820AD1');
  const [newCardDueDay, setNewCardDueDay] = useState<number>(10);
  const [newCardClosingDay, setNewCardClosingDay] = useState<number>(3);

  // Invoice payment form state
  const [paymentAccount, setPaymentAccount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Invoice editor form state
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editClosingDate, setEditClosingDate] = useState<string>('');
  const [editLimitAmount, setEditLimitAmount] = useState<string>('');
  const [editAdjustedAmount, setEditAdjustedAmount] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'open' | 'closed' | 'paid'>('open');

  // New Card Transaction form state
  const [newTxDesc, setNewTxDesc] = useState<string>('');
  const [newTxAmount, setNewTxAmount] = useState<string>('');
  const [newTxCategory, setNewTxCategory] = useState<string>('');
  const [newTxDate, setNewTxDate] = useState<string>('');

  // Installments and Deletion States
  const [isInstallments, setIsInstallments] = useState<boolean>(false);
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Account | null>(null);

  // Helper to calculate total unpaid card credit used globally (including past and future months/installments)
  const getCardLimitsGlobal = (cardId: string, creditLimit: number) => {
    const allMonthsSet = new Set<string>();
    transactions
      .filter(t => t.account === cardId)
      .forEach(t => allMonthsSet.add(t.date.slice(0, 7)));
    cardInvoices
      .filter(inv => inv.cardId === cardId)
      .forEach(inv => allMonthsSet.add(inv.month));

    let totalUnpaid = 0;

    allMonthsSet.forEach(monthStr => {
      const inv = cardInvoices.find(i => i.cardId === cardId && i.month === monthStr);
      if (inv && inv.status === 'paid') {
        return; // Already paid, doesn't consume limit
      }

      if (inv && inv.adjustedAmount !== undefined) {
        totalUnpaid += inv.adjustedAmount;
      } else {
        const monthTxSum = transactions
          .filter(t => t.account === cardId && t.date.startsWith(monthStr) && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        totalUnpaid += monthTxSum;
      }
    });

    return {
      totalUsed: totalUnpaid,
      available: Math.max(0, creditLimit - totalUnpaid),
      percentUsed: Math.min(100, Math.round((totalUnpaid / creditLimit) * 100))
    };
  };

  // Active card details
  const selectedCard = creditCards.find(c => c.id === selectedCardId);

  // 1. Month label helper (e.g. "Julho de 2026")
  const getMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  };

  // Navigating months (past or future)
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-');
    let newYear = parseInt(year);
    let newMonth = parseInt(month) - 1;
    if (newMonth === 0) {
      newMonth = 12;
      newYear -= 1;
    }
    const monthPad = String(newMonth).padStart(2, '0');
    setSelectedMonth(`${newYear}-${monthPad}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-');
    let newYear = parseInt(year);
    let newMonth = parseInt(month) + 1;
    if (newMonth === 13) {
      newMonth = 1;
      newYear += 1;
    }
    const monthPad = String(newMonth).padStart(2, '0');
    setSelectedMonth(`${newYear}-${monthPad}`);
  };

  // 2. Fetch invoice info for selected card and month
  // If invoice record doesn't exist, we generate values dynamically based on card settings
  const invoiceId = selectedCardId ? `${selectedCardId}-${selectedMonth}` : '';
  const existingInvoice = cardInvoices.find(inv => inv.id === invoiceId);

  const getInvoiceDetails = () => {
    if (!selectedCard) return null;

    // Default dates based on selectedMonth and due/closing days
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);

    const defaultDueDay = newCardDueDay; // typically fallback, but let's check custom or default
    const defaultCloseDay = newCardClosingDay;

    const pad = (num: number) => String(num).padStart(2, '0');
    const defaultDueDateStr = `${year}-${pad(month)}-${pad(10)}`; // typical fallback due date
    const defaultClosingDateStr = `${year}-${pad(month)}-${pad(3)}`;

    // Calculate actual card transactions for selected month
    const cardTransactions = transactions.filter(
      t => t.account === selectedCard.id && t.date.startsWith(selectedMonth) && t.type === 'expense'
    );
    const dynamicTotal = cardTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (existingInvoice) {
      return {
        ...existingInvoice,
        dynamicTotal,
        finalTotal: existingInvoice.adjustedAmount !== undefined ? existingInvoice.adjustedAmount : dynamicTotal,
        limit: existingInvoice.limitAmount || selectedCard.creditLimit || 5000,
        transactions: cardTransactions
      };
    } else {
      // Create a virtual open/closed invoice based on time
      const todayStr = new Date().toISOString().split('T')[0];
      const virtualStatus: 'open' | 'closed' = selectedMonth < currentMonth ? 'closed' : 'open';

      return {
        id: invoiceId,
        cardId: selectedCard.id,
        month: selectedMonth,
        status: virtualStatus,
        dueDate: defaultDueDateStr,
        closingDate: defaultClosingDateStr,
        dynamicTotal,
        finalTotal: dynamicTotal,
        limit: selectedCard.creditLimit || 5000,
        transactions: cardTransactions,
        adjustedAmount: undefined as number | undefined,
        limitAmount: undefined as number | undefined,
        paymentDate: undefined as string | undefined,
        paymentAccount: undefined as string | undefined
      };
    }
  };

  const invoice = getInvoiceDetails();

  // Initializing Invoice Edit states
  const openInvoiceEditor = () => {
    if (!invoice) return;
    setEditDueDate(invoice.dueDate);
    setEditClosingDate(invoice.closingDate);
    setEditLimitAmount(String(invoice.limit || ''));
    setEditAdjustedAmount(invoice.adjustedAmount !== undefined ? String(invoice.adjustedAmount) : '');
    setEditStatus(invoice.status);
    setIsEditInvoiceOpen(true);
  };

  const handleSaveInvoiceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !invoice) return;

    const updatedInv: CardInvoice = {
      id: invoiceId,
      cardId: selectedCardId,
      month: selectedMonth,
      status: editStatus,
      dueDate: editDueDate,
      closingDate: editClosingDate,
      limitAmount: editLimitAmount ? parseFloat(editLimitAmount) : undefined,
      adjustedAmount: editAdjustedAmount ? parseFloat(editAdjustedAmount) : undefined
    };

    onUpdateInvoice(updatedInv);
    setIsEditInvoiceOpen(false);

    // Sync card balance (used credit) in accounts list
    // Sum of current month's invoice final total
    const newUsed = updatedInv.adjustedAmount !== undefined ? updatedInv.adjustedAmount : invoice.dynamicTotal;
    onEditAccount(selectedCardId, {
      creditUsed: newUsed,
      balance: -newUsed
    });
  };

  // Paying Invoice Handler
  const openPayInvoiceModal = () => {
    if (!invoice) return;
    const checkingAccounts = accounts.filter(a => a.type !== 'credit_card');
    setPaymentAccount(checkingAccounts.length > 0 ? checkingAccounts[0].id : '');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentAmount(String(invoice.finalTotal));
    setIsPayInvoiceOpen(true);
  };

  const handlePayInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId || !invoice || !paymentAccount) return;

    const payVal = parseFloat(paymentAmount) || invoice.finalTotal;

    // 1. Mark Invoice as paid
    const updatedInv: CardInvoice = {
      id: invoiceId,
      cardId: selectedCardId,
      month: selectedMonth,
      status: 'paid',
      dueDate: invoice.dueDate,
      closingDate: invoice.closingDate,
      adjustedAmount: invoice.adjustedAmount,
      limitAmount: invoice.limit,
      paymentDate: paymentDate,
      paymentAccount: paymentAccount
    };

    onUpdateInvoice(updatedInv);

    // 2. Add an expense transaction to the chosen payment account to represent paying the credit card bill
    const sourceAcc = accounts.find(a => a.id === paymentAccount);
    onAddTransaction({
      description: `Pagamento Fatura ${selectedCard.name} - ${getMonthLabel(selectedMonth)}`,
      amount: payVal,
      type: 'expense',
      category: 'cat-outros-desp',
      date: paymentDate,
      account: paymentAccount,
      status: 'paid',
      isSynced: false
    });

    // 3. Clear creditUsed or reduce it for the card
    onEditAccount(selectedCardId, {
      creditUsed: 0,
      balance: 0
    });

    setIsPayInvoiceOpen(false);
  };

  // Add Card Transaction Handler
  const handleAddCardTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardId) return;

    const amountNum = parseFloat(newTxAmount);
    if (!amountNum || !newTxDesc || !newTxCategory || !newTxDate) return;

    if (isInstallments && installmentsCount > 1) {
      const partAmount = Math.round((amountNum / installmentsCount) * 100) / 100;
      const [yearStr, monthStr, dayStr] = newTxDate.split('-');
      let year = parseInt(yearStr);
      let month = parseInt(monthStr);
      let day = parseInt(dayStr);

      for (let i = 1; i <= installmentsCount; i++) {
        const currentMonthPad = String(month).padStart(2, '0');
        const currentDayPad = String(day).padStart(2, '0');
        const installmentDate = `${year}-${currentMonthPad}-${currentDayPad}`;

        onAddTransaction({
          description: `${newTxDesc} (${i}/${installmentsCount})`,
          amount: partAmount,
          type: 'expense',
          category: newTxCategory,
          date: installmentDate,
          account: selectedCardId,
          status: 'paid', // credit card transactions are usually fully authorized instantly
          isSynced: false
        });

        // Increment month
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
    } else {
      onAddTransaction({
        description: newTxDesc,
        amount: amountNum,
        type: 'expense',
        category: newTxCategory,
        date: newTxDate,
        account: selectedCardId,
        status: 'paid', // credit card transactions are usually fully authorized instantly
        isSynced: false
      });
    }

    // Reset fields
    setNewTxDesc('');
    setNewTxAmount('');
    setNewTxCategory(categories.find(c => c.type === 'expense')?.id || '');
    setNewTxDate(selectedMonth + '-10'); // Default to middle of month
    setIsInstallments(false);
    setInstallmentsCount(2);
    setIsAddTxOpen(false);

    // Dynamic used value will auto-update because transactions changed
  };

  // Add New Credit Card Account
  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newCardLimit);
    if (!newCardName || !limitNum) return;

    onAddAccount({
      name: newCardName,
      type: 'credit_card',
      balance: 0,
      color: newCardColor,
      icon: 'CreditCard',
      creditLimit: limitNum,
      creditUsed: 0
    });

    // Reset & close
    setNewCardName('');
    setNewCardLimit('');
    setNewCardColor('#820AD1');
    setIsAddCardOpen(false);
  };

  // Format Helper
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Bar: Title and Add Card Button */}
      <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
            <CreditCard className="w-5.5 h-5.5 text-teal-400" /> Meus Cartões de Crédito
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
            Monitore seus limites de crédito, acompanhe lançamentos por fatura mensal, planeje vencimentos e controle faturas passadas ou futuras facilmente.
          </p>
        </div>
        <button 
          onClick={() => setIsAddCardOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/15"
          id="open-add-card-modal"
        >
          <Plus className="w-4.5 h-4.5" /> Adicionar Cartão
        </button>
      </div>

      {/* 2. List of Registered Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creditCards.length === 0 ? (
          <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 col-span-3 space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="font-bold text-slate-900 dark:text-white text-sm">Nenhum cartão cadastrado</p>
            <p className="text-xs max-w-md mx-auto leading-relaxed text-slate-600 dark:text-slate-300">
              Clique no botão "Adicionar Cartão" acima para cadastrar seu primeiro cartão de crédito e gerenciar seus limites e faturas!
            </p>
          </div>
        ) : (
          creditCards.map(card => {
            const isSelected = card.id === selectedCardId;
            const limit = card.creditLimit || 5000;
            // Let's find dynamic spent for current selection
            const cardTransactionsThisMonth = transactions.filter(
              t => t.account === card.id && t.date.startsWith(selectedMonth) && t.type === 'expense'
            );
            const cardSpentThisMonth = cardTransactionsThisMonth.reduce((sum, t) => sum + t.amount, 0);
            
            // Look if invoice exists for this month
            const matchedInv = cardInvoices.find(inv => inv.id === `${card.id}-${selectedMonth}`);
            const finalCardSpent = matchedInv?.adjustedAmount !== undefined ? matchedInv.adjustedAmount : cardSpentThisMonth;
            
            // Calculate global limits including past and future installments
            const globalLimits = getCardLimitsGlobal(card.id, limit);

            return (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedCardId(card.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 relative overflow-hidden ${
                  isSelected 
                    ? 'glass border-teal-500/30 shadow-xl shadow-teal-500/5' 
                    : 'glass-dark border-slate-900/5 dark:border-white/5 opacity-70 hover:opacity-100 shadow-md'
                }`}
                id={`card-selector-${card.id}`}
              >
                {/* Visual Top Accent Card Color */}
                <div 
                  className="absolute top-0 left-0 w-full h-1.5"
                  style={{ backgroundColor: card.color }}
                ></div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base font-display block leading-tight">{card.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">Cartão de Crédito</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardToDelete(card);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/15 cursor-pointer"
                      title="Deletar Cartão"
                      id={`delete-card-btn-${card.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div 
                      className="p-1.5 rounded-lg text-slate-900 dark:text-white"
                      style={{ backgroundColor: card.color + '20', color: card.color }}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Fatura {getMonthLabel(selectedMonth).split(' ')[0]}</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base font-display">{formatCurrency(finalCardSpent)}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${globalLimits.percentUsed}%`, 
                          backgroundColor: globalLimits.percentUsed > 85 ? '#EF4444' : globalLimits.percentUsed > 60 ? '#F59E0B' : card.color 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                      <span>{globalLimits.percentUsed}% do Limite Geral</span>
                      <span>Disponível: {formatCurrency(globalLimits.available)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 3. Invoice Management (Active Month Card Details) */}
      {selectedCard && invoice && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column A: Active Month Invoice Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden">
              
              {/* Header Navigator */}
              <div className="flex items-center justify-between border-b border-slate-900/5 dark:border-white/5 pb-4">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-900/5 dark:border-white/5"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight font-display text-center select-none">
                  {getMonthLabel(selectedMonth)}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-900/5 dark:border-white/5"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Status Info Badge */}
              <div className="text-center py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Situação da Fatura</p>
                {invoice.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" /> Fatura Paga
                  </span>
                ) : invoice.status === 'closed' ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Fatura Fechada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/25 text-teal-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Aberta (Lançando)
                  </span>
                )}
              </div>

              {/* Invoice Values Grid */}
              <div className="space-y-4">
                <div className="p-4 glass-dark rounded-xl border border-slate-900/5 dark:border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Valor Total da Fatura</span>
                  <div className="flex items-baseline gap-1.5 justify-between">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-display">
                      {formatCurrency(invoice.finalTotal)}
                    </span>
                    {invoice.adjustedAmount !== undefined && (
                      <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 font-bold" title="O valor real foi sobrescrito manualmente">
                        Valor Ajustado
                      </span>
                    )}
                  </div>
                  {invoice.adjustedAmount !== undefined && invoice.dynamicTotal !== invoice.finalTotal && (
                    <span className="text-[10px] text-slate-500 block">
                      Soma dos lançamentos: {formatCurrency(invoice.dynamicTotal)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 glass-dark rounded-xl border border-slate-900/5 dark:border-white/5">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">Fechamento</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      {invoice.closingDate.split('-').reverse().slice(0, 2).join('/')}
                    </span>
                  </div>
                  <div className="p-3 glass-dark rounded-xl border border-slate-900/5 dark:border-white/5">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase block mb-1">Vencimento</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {invoice.dueDate.split('-').reverse().slice(0, 2).join('/')}
                    </span>
                  </div>
                </div>


                {/* Limite Geral do Cartão including past & future installments */}
                <div className="p-4 bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase">Limite Geral do Cartão</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">Total: {formatCurrency(selectedCard.creditLimit || 5000)}</span>
                  </div>
                  
                  {(() => {
                    const globalLim = getCardLimitsGlobal(selectedCard.id, selectedCard.creditLimit || 5000);
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">Total Utilizado:</span>
                          <span className="font-extrabold text-rose-400">{formatCurrency(globalLim.totalUsed)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400 font-semibold">Limite Disponível:</span>
                          <span className="font-extrabold text-teal-400">{formatCurrency(globalLim.available)}</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${globalLim.percentUsed}%`, 
                              backgroundColor: globalLim.percentUsed > 85 ? '#EF4444' : globalLim.percentUsed > 60 ? '#F59E0B' : selectedCard.color 
                            }}
                          ></div>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-normal pt-1">
                          * Este limite geral considera todas as compras e parcelas (passadas, atuais e futuras) de faturas não pagas.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-900/5 dark:border-white/5">
                <button 
                  onClick={openInvoiceEditor}
                  className="w-full text-center py-2.5 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:bg-white/10 border border-slate-900/10 dark:border-white/10 hover:border-slate-900/20 dark:border-white/20 transition-all rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="edit-invoice-settings-btn"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Ajustar Vencimento / Valores
                </button>
                {invoice.status !== 'paid' && (
                  <button 
                    onClick={openPayInvoiceModal}
                    disabled={invoice.finalTotal === 0}
                    className="w-full text-center py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-900/5 dark:bg-white/5 disabled:text-slate-500 transition-all rounded-xl text-xs font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/10"
                    id="pay-invoice-btn"
                  >
                    <Check className="w-3.5 h-3.5" /> Pagar Fatura do Mês
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Column B & C: Transactions list of selected invoice */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass border border-slate-900/5 dark:border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
              
              <div className="flex justify-between items-center border-b border-slate-900/5 dark:border-white/5 pb-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-display">Lançamentos da Fatura</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Transações do cartão {selectedCard.name} no mês de {getMonthLabel(selectedMonth).toLowerCase()}</p>
                </div>
                <button 
                  onClick={() => {
                    setNewTxDesc('');
                    setNewTxAmount('');
                    setNewTxCategory(categories.find(c => c.type === 'expense')?.id || '');
                    setNewTxDate(selectedMonth + '-10'); // Default to 10th of selected month
                    setIsAddTxOpen(true);
                  }}
                  className="bg-slate-900/10 dark:bg-white/10 hover:bg-white/15 border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
                  id="add-invoice-transaction-btn"
                >
                  <Plus className="w-3.5 h-3.5" /> Lançar Despesa
                </button>
              </div>

              {/* Transactions Table */}
              <div className="overflow-hidden rounded-xl border border-slate-900/5 dark:border-white/5">
                {invoice.transactions.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 dark:text-slate-400 space-y-2">
                    <HelpCircle className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="font-bold text-slate-900 dark:text-white text-sm">Nenhuma despesa lançada</p>
                    <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-500 dark:text-slate-400">
                      Não há nenhuma transação registrada neste cartão para o mês selecionado. Clique em "Lançar Despesa" acima para adicionar.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/5 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-900/5 dark:border-white/5">
                          <th className="py-2.5 px-4 w-20 whitespace-nowrap">Data</th>
                          <th className="py-2.5 px-3 whitespace-nowrap min-w-[150px]">Descrição</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Categoria</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Valor</th>
                          <th className="py-2.5 px-4 text-center w-20 whitespace-nowrap">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/5 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-200">
                        {invoice.transactions.map(t => {
                          const cat = categories.find(c => c.id === t.category) || categories[categories.length - 1];
                          return (
                            <tr key={t.id} className="hover:bg-slate-900/5 dark:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {t.date.split('-').slice(1, 3).reverse().join('/')}
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white min-w-[150px]">
                                {t.description}
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: cat.color + '15', color: cat.color }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                  {cat.name}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-extrabold text-rose-400 font-display whitespace-nowrap">
                                - {formatCurrency(t.amount)}
                              </td>
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <button 
                                  onClick={() => setTransactionToDelete(t.id)}
                                  className="p-1 hover:bg-rose-500/15 rounded text-slate-500 dark:text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- 4. MODALS SECTION --- */}
      
      {/* A. ADD NEW CREDIT CARD MODAL */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
              id="add-card-modal-body"
            >
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
                  <CreditCard className="w-5 h-5 text-teal-400" /> Novo Cartão de Crédito
                </h3>
                <button onClick={() => setIsAddCardOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCardSubmit} className="p-6 space-y-4">
                
                {/* Card Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Nome do Cartão</label>
                  <input 
                    type="text"
                    required
                    placeholder="ex: Itaú Click Visa, Nubank..."
                    value={newCardName}
                    onChange={e => setNewCardName(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                    id="new-card-name-input"
                  />
                </div>

                {/* Credit Limit */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Limite Total (R$)</label>
                  <input 
                    type="number"
                    required
                    placeholder="ex: 5000"
                    value={newCardLimit}
                    onChange={e => setNewCardLimit(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                    id="new-card-limit-input"
                  />
                </div>

                {/* Color Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Cor do Cartão</label>
                  <div className="flex gap-2.5 py-1">
                    {['#820AD1', '#FF6F00', '#1E293B', '#10B981', '#3B82F6', '#EF4444'].map(c => (
                      <button 
                        key={c}
                        type="button"
                        onClick={() => setNewCardColor(c)}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer border ${
                          newCardColor === c ? 'border-white scale-110 ring-2 ring-teal-500/50' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Due / Closing Days */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Dia Vencimento</label>
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={newCardDueDay}
                      onChange={e => setNewCardDueDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full text-xs font-semibold px-3 py-2 glass-input rounded-xl focus:outline-none text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Dia Fechamento</label>
                    <input 
                      type="number"
                      min="1"
                      max="31"
                      value={newCardClosingDay}
                      onChange={e => setNewCardClosingDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full text-xs font-semibold px-3 py-2 glass-input rounded-xl focus:outline-none text-center"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsAddCardOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="save-new-card-btn"
                  >
                    Salvar Cartão
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. EDIT INVOICE METADATA & OVERRIDES MODAL */}
      <AnimatePresence>
        {isEditInvoiceOpen && invoice && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
              id="edit-invoice-modal-body"
            >
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
                  <Edit2 className="w-5 h-5 text-teal-400" /> Ajustar Fatura - {getMonthLabel(selectedMonth).split(' ')[0]}
                </h3>
                <button onClick={() => setIsEditInvoiceOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInvoiceSettings} className="p-6 space-y-4">
                
                {/* Status Switcher */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Situação da Fatura</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full text-xs font-semibold glass-input px-3 py-2.5 rounded-xl focus:outline-none"
                  >
                    <option value="open" className="bg-slate-900 text-slate-900 dark:text-white">Aberta (Em Lançamento)</option>
                    <option value="closed" className="bg-slate-900 text-slate-900 dark:text-white">Fechada (Aguardando Pagamento)</option>
                    <option value="paid" className="bg-slate-900 text-slate-900 dark:text-white">Paga (Liquidada)</option>
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data de Vencimento</label>
                  <input 
                    type="date"
                    required
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                </div>

                {/* Closing Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data de Fechamento</label>
                  <input 
                    type="date"
                    required
                    value={editClosingDate}
                    onChange={e => setEditClosingDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                </div>

                {/* Custom Limit Override for this month */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Limite Específico do Mês (Opcional)</label>
                  <input 
                    type="number"
                    placeholder={`Deixar em branco para usar o geral (${formatCurrency(selectedCard.creditLimit || 5000)})`}
                    value={editLimitAmount}
                    onChange={e => setEditLimitAmount(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                </div>

                {/* Manual Adjusted Amount Overrides */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Ajuste Manual do Valor Total (Opcional)</label>
                  <input 
                    type="number"
                    placeholder={`Soma automática atual: ${formatCurrency(invoice.dynamicTotal)}`}
                    value={editAdjustedAmount}
                    onChange={e => setEditAdjustedAmount(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-300 leading-normal font-medium mt-1">
                    Preencher este campo irá forçar o valor total da fatura deste mês, ignorando temporariamente a soma dos lançamentos inseridos.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsEditInvoiceOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="save-invoice-adjustments-btn"
                  >
                    Salvar Ajustes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. PAY MONTHLY BILL / INVOICE MODAL */}
      <AnimatePresence>
        {isPayInvoiceOpen && invoice && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
              id="pay-invoice-modal-body"
            >
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
                  <CheckCircle className="w-5 h-5 text-teal-400" /> Liquidar Fatura do Cartão
                </h3>
                <button onClick={() => setIsPayInvoiceOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePayInvoiceSubmit} className="p-6 space-y-4">
                
                <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20 text-center">
                  <p className="text-xs text-teal-300 font-bold uppercase tracking-wider">Fatura {getMonthLabel(selectedMonth)}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-display">{formatCurrency(invoice.finalTotal)}</p>
                </div>

                {/* Source Account selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Conta Corrente de Origem (Para o débito)</label>
                  <select 
                    required
                    value={paymentAccount}
                    onChange={e => setPaymentAccount(e.target.value)}
                    className="w-full text-xs font-semibold glass-input px-3 py-2.5 rounded-xl focus:outline-none"
                    id="payment-source-account"
                  >
                    <option value="" disabled>Escolha a conta de pagamento</option>
                    {accounts.filter(a => a.type !== 'credit_card').map(a => (
                      <option key={a.id} value={a.id} className="bg-slate-900 text-slate-900 dark:text-white">
                        {a.name} (Saldo: {formatCurrency(a.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data de Pagamento</label>
                  <input 
                    type="date"
                    required
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                </div>

                {/* Payment Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Valor Pago (R$)</label>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full text-sm font-bold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsPayInvoiceOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="confirm-invoice-payment-btn"
                  >
                    Confirmar Pagamento
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. ADD TRANSACTION DIRECTLY TO INVOICE */}
      <AnimatePresence>
        {isAddTxOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl w-full max-w-sm overflow-hidden border border-white/12"
              id="add-invoice-tx-modal-body"
            >
              <div className="p-6 border-b border-slate-900/5 dark:border-white/5 flex justify-between items-center bg-slate-900/5 dark:bg-white/5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2 font-display">
                  <ArrowDownRight className="w-5.5 h-5.5 text-rose-400 bg-rose-500/15 rounded-full p-0.5" /> Lançar Despesa no Cartão
                </h3>
                <button onClick={() => setIsAddTxOpen(false)} className="p-1 hover:bg-slate-900/10 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCardTransactionSubmit} className="p-6 space-y-4">
                
                {/* Value */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Valor da Despesa (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={newTxAmount}
                    onChange={e => setNewTxAmount(e.target.value)}
                    className="w-full text-lg font-bold px-3 py-2 glass-input rounded-xl focus:outline-none"
                    id="new-invoice-tx-amount-input"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Descrição</label>
                  <input 
                    type="text"
                    required
                    placeholder="ex: Posto de Combustível, Jantar..."
                    value={newTxDesc}
                    onChange={e => setNewTxDesc(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                    id="new-invoice-tx-desc-input"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Categoria</label>
                  <select 
                    required
                    value={newTxCategory}
                    onChange={e => setNewTxCategory(e.target.value)}
                    className="w-full text-xs font-semibold glass-input px-3 py-2.5 rounded-xl focus:outline-none"
                    id="new-invoice-tx-cat-select"
                  >
                    <option value="" disabled>Selecionar Categoria</option>
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Data da Compra</label>
                  <input 
                    type="date"
                    required
                    value={newTxDate}
                    onChange={e => setNewTxDate(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2.5 glass-input rounded-xl focus:outline-none"
                    id="new-invoice-tx-date-input"
                  />
                </div>

                {/* Installments Option */}
                <div className="space-y-3 p-3 bg-slate-900/5 dark:bg-white/5 rounded-xl border border-slate-900/5 dark:border-white/5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={isInstallments}
                      onChange={e => setIsInstallments(e.target.checked)}
                      className="rounded border-slate-900/10 dark:border-white/10 text-teal-600 focus:ring-teal-500/50 w-4 h-4"
                    />
                    <span>Parcelar esta despesa?</span>
                  </label>

                  {isInstallments && (
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-900/5 dark:border-white/5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Quantidade de Parcelas</label>
                      <input 
                        type="number"
                        min="2"
                        max="24"
                        required={isInstallments}
                        value={installmentsCount}
                        onChange={e => setInstallmentsCount(Math.min(24, Math.max(2, parseInt(e.target.value) || 2)))}
                        className="w-full text-xs font-bold px-3 py-2 glass-input rounded-xl focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500 leading-tight block">
                        Isso criará {installmentsCount} lançamentos iguais mensais de {formatCurrency(Math.round((parseFloat(newTxAmount) || 0) / installmentsCount * 100) / 100)} nas faturas subsequentes.
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-900/5 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsAddTxOpen(false)}
                    className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2.5 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-teal-500/10"
                    id="save-invoice-tx-btn"
                  >
                    Salvar Compra
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. CONFIRM DELETE TRANSACTION MODAL */}
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
                Tem certeza que deseja realmente excluir este lançamento da fatura? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setTransactionToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteTransaction(transactionToDelete);
                    setTransactionToDelete(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 py-2 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-rose-500/15"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* F. CONFIRM DELETE CREDIT CARD MODAL */}
      <AnimatePresence>
        {cardToDelete && (
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
                Tem certeza que deseja realmente excluir o cartão de crédito <strong>{cardToDelete.name}</strong>? Esta ação excluirá permanentemente o limite do cartão e todas as faturas cadastradas.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setCardToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/10 dark:bg-white/10 py-2 rounded-xl border border-slate-900/10 dark:border-white/10 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteAccount(cardToDelete.id);
                    setCardToDelete(null);
                  }}
                  className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 py-2 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-rose-500/15"
                  id="confirm-delete-card-btn"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
