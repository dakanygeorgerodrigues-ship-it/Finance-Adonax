import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, DollarSign, ListOrdered, TrendingUp, ArrowRight, X, SkipForward, Check, CreditCard } from 'lucide-react';
import { Account, Transaction, Goal, Category } from '../types';

interface GuidedTourProps {
  categories: Category[];
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddBudget: (category: string, limitAmount: number) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onComplete: () => void;
}

export default function GuidedTour({ categories, accounts, onAddAccount, onAddTransaction, onAddBudget, onAddGoal, onComplete }: GuidedTourProps) {
  const [step, setStep] = useState(1);

  // Form states
  const [accountName, setAccountName] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardLimit, setCardLimit] = useState('');

  const [transactionDesc, setTransactionDesc] = useState('');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'income'|'expense'>('expense');

  const [budgetAmount, setBudgetAmount] = useState('');
  
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const nextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSaveAccount = () => {
    if (accountName && accountBalance) {
      onAddAccount({
        name: accountName,
        type: 'checking',
        balance: parseFloat(accountBalance) || 0,
        color: '#820AD1',
        icon: 'Wallet'
      });
    }
    nextStep();
  };

  const handleSaveCard = () => {
    if (cardName && cardLimit) {
      onAddAccount({
        name: cardName,
        type: 'credit_card',
        balance: 0,
        creditLimit: parseFloat(cardLimit) || 0,
        creditUsed: 0,
        color: '#EAB308',
        icon: 'CreditCard'
      });
    }
    nextStep();
  };

  const handleSaveTransaction = () => {
    if (transactionDesc && transactionAmount) {
      const defaultCategory = categories.find(c => c.type === transactionType)?.id || '';
      const fallbackAccount = accounts.length > 0 ? accounts[0].id : '';
      onAddTransaction({
        description: transactionDesc,
        amount: parseFloat(transactionAmount) || 0,
        type: transactionType,
        category: defaultCategory,
        date: new Date().toISOString().split('T')[0],
        account: fallbackAccount,
        status: 'paid'
      });
    }
    nextStep();
  };

  const handleSaveBudget = () => {
    if (budgetAmount) {
      const defaultCategory = categories.find(c => c.type === 'expense')?.id || '';
      onAddBudget(defaultCategory, parseFloat(budgetAmount) || 0);
    }
    nextStep();
  };

  const handleSaveGoal = () => {
    if (goalName && goalTarget) {
      onAddGoal({
        name: goalName,
        targetAmount: parseFloat(goalTarget) || 0,
        currentAmount: 0,
        deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        color: '#10B981'
      });
    }
    nextStep();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-modal w-full max-w-lg p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>
        
        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          title="Fechar Tour"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-between items-center mb-6 pt-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${
                  step === i ? 'w-8 bg-teal-500' : 
                  step > i ? 'w-2 bg-teal-500/50' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passo {step} de 5</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sua Primeira Conta</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Para começar a controlar suas finanças, adicione sua conta bancária principal ou sua carteira.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nome da Conta</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={e => setAccountName(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="Ex: Nubank, Itaú, Carteira..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Saldo Atual (R$)</label>
                    <input
                      type="number"
                      value={accountBalance}
                      onChange={e => setAccountBalance(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleSaveAccount}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Salvar e Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Pular este passo <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Adicionar Cartão</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Vamos cadastrar seu cartão de crédito para centralizar seus gastos.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Nome do Cartão (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Nubank, Itau..."
                      className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Limite do Cartão</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                      <input 
                        type="number" 
                        placeholder="0,00"
                        className="w-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono font-bold"
                        value={cardLimit}
                        onChange={e => setCardLimit(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    onClick={nextStep}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors border border-transparent"
                  >
                    Pular
                  </button>
                  <button 
                    onClick={handleSaveCard}
                    disabled={!cardName || !cardLimit}
                    className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Salvar <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registre um Gasto</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Que tal anotar sua primeira despesa ou receita para ver como o dashboard ganha vida?</p>
                </div>

                <div className="space-y-4">
                  <div className="flex p-1 bg-slate-900/5 dark:bg-white/5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setTransactionType('expense')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${transactionType === 'expense' ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-sm' : 'text-slate-500'}`}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransactionType('income')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${transactionType === 'income' ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500'}`}
                    >
                      Receita
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Descrição</label>
                    <input
                      type="text"
                      value={transactionDesc}
                      onChange={e => setTransactionDesc(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder={transactionType === 'expense' ? "Ex: Almoço, Uber..." : "Ex: Salário, Pix..."}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Valor (R$)</label>
                    <input
                      type="number"
                      value={transactionAmount}
                      onChange={e => setTransactionAmount(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleSaveTransaction}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Salvar e Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Pular este passo <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListOrdered className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Defina um Orçamento</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Os orçamentos te ajudam a não gastar mais do que deveria em uma categoria.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Limite Mensal para "Alimentação" (R$)</label>
                    <input
                      type="number"
                      value={budgetAmount}
                      onChange={e => setBudgetAmount(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="Ex: 800.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleSaveBudget}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Salvar e Continuar <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Pular este passo <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crie um Objetivo</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Ter metas claras é o segredo para economizar. Qual seu próximo grande sonho?</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Nome do Objetivo</label>
                    <input
                      type="text"
                      value={goalName}
                      onChange={e => setGoalName(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="Ex: Viagem, Carro Novo, Reserva..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Valor Necessário (R$)</label>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={e => setGoalTarget(e.target.value)}
                      className="w-full glass-input rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-teal-500/50"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleSaveGoal}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    Concluir Tour <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={nextStep}
                    className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Pular e Finalizar <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
