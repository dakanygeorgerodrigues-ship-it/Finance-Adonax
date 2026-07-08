/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Account } from '../types';
import { 
  Check, 
  Smartphone, 
  Plus, 
  Trash2, 
  Edit2, 
  Coins, 
  CreditCard,
  Building,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccountsManagerProps {
  accounts: Account[];
  onAddAccount: (acc: Omit<Account, 'id'>) => void;
  onEditAccount: (id: string, updates: Partial<Account>) => void;
  onDeleteAccount: (id: string) => void;
}

const PRESET_COLORS = [
  '#820AD1', '#FF6F00', '#CC092F', '#FDF123', '#FF7A00', 
  '#1E1E1E', '#00E5FF', '#11C76F', '#009EE3', '#00CD6C', 
  '#EC0000', '#005CA9', '#0D9488', '#10B981', '#3B82F6', '#475569'
];

export default function AccountsManager({
  accounts,
  onAddAccount,
  onEditAccount,
  onDeleteAccount
}: AccountsManagerProps) {
  const [activeStep, setActiveStep] = useState<'list' | 'manual_form' | 'manual_edit'>('list');
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // States for Manual Account Form
  const [manualName, setManualName] = useState('');
  const [manualType, setManualType] = useState<'checking' | 'savings' | 'cash'>('checking');
  const [manualBalance, setManualBalance] = useState('');
  const [manualColor, setManualColor] = useState('#475569');
  const [manualIcon, setManualIcon] = useState('Smartphone');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const handleOpenManualForm = () => {
    setManualName('');
    setManualType('checking');
    setManualBalance('');
    setManualColor('#475569');
    setManualIcon('Smartphone');
    setEditingAccountId(null);
    setActiveStep('manual_form');
  };

  const handleOpenManualEdit = (acc: Account) => {
    setEditingAccountId(acc.id);
    setManualName(acc.name);
    setManualType(acc.type as 'checking' | 'savings' | 'cash');
    setManualBalance(acc.balance.toString());
    setManualColor(acc.color);
    setManualIcon(acc.icon);
    setActiveStep('manual_edit');
  };

  const handleSaveManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(manualBalance) || 0;
    
    if (activeStep === 'manual_edit' && editingAccountId) {
      onEditAccount(editingAccountId, {
        name: manualName,
        type: manualType,
        balance: balanceNum,
        color: manualColor,
        icon: manualIcon
      });
    } else {
      onAddAccount({
        name: manualName,
        type: manualType,
        balance: balanceNum,
        color: manualColor,
        icon: manualIcon,
        synced: false
      });
    }
    setActiveStep('list');
  };

  const handleDeleteManualAccountConfirm = () => {
    if (accountToDelete) {
      onDeleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getAccountIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone': return <Smartphone className="w-4 h-4" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4" />;
      case 'Coins': return <Coins className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  // Filtrar contas que não são cartões de crédito
  const bankAccounts = accounts.filter(acc => acc.type !== 'credit_card');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-1 text-slate-800 dark:text-white">
          <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 font-display">
            <Building className="w-6 h-6 text-teal-500" />
            Contas Bancárias
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gerencie suas contas e saldos
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Lado Esquerdo: Lista de Contas */}
        <div className="w-full md:w-[60%] flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" /> 
              Minhas Contas
            </h3>
            
            {bankAccounts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-600">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Building className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Nenhuma conta cadastrada</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-[200px] mx-auto">
                    Adicione contas manualmente usando o painel ao lado.
                  </p>
                </div>
              </div>
            ) : (
              bankAccounts.map(acc => (
                <div 
                  key={acc.id} 
                  className="p-3 border border-slate-150 dark:border-slate-700 rounded-xl hover:border-teal-200 hover:shadow-md transition-all group bg-white dark:bg-slate-800 flex items-center gap-3 relative overflow-hidden"
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: acc.color }}
                  ></div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shrink-0 shadow-inner ml-1"
                    style={{ backgroundColor: acc.color }}
                  >
                    {getAccountIconComponent(acc.icon)}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate block">{acc.name}</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize block">
                        {acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : 'Dinheiro Físico'}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">
                      {formatCurrency(acc.balance)}
                    </div>
                  </div>
                  
                  {/* Controles da Conta */}
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleOpenManualEdit(acc)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Editar Conta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Conta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado Direito: Formulários ou Opções */}
        <div className="w-full md:w-[40%] bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl p-5 shadow-sm min-h-[300px] flex flex-col relative overflow-hidden">
          
          {/* PASSO 1: Seleção de Ação */}
          {activeStep === 'list' && (
            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Building className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-[240px]">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Gerencie seus Saldos</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Adicione contas manualmente para controlar seu dinheiro de forma simples e direta.
                </p>
              </div>
              <button
                onClick={handleOpenManualForm}
                className="mt-4 w-full text-xs font-extrabold text-slate-900 dark:text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-slate-800/10 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Nova Conta
              </button>
            </div>
          )}

          {/* FORMULÁRIO DE ADIÇÃO OU EDIÇÃO MANUAL */}
          {(activeStep === 'manual_form' || activeStep === 'manual_edit') && (
            <div className="max-w-md mx-auto w-full space-y-5 py-2 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm md:text-base font-display">
                    {activeStep === 'manual_edit' ? 'Editar Conta' : 'Adicionar Conta'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Preencha as informações da conta.
                  </p>
                </div>
                
                <form onSubmit={handleSaveManualAccount} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nome da Instituição</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Minha Conta Corrente"
                        value={manualName}
                        onChange={e => setManualName(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-slate-600 dark:focus:border-slate-400 bg-slate-50 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tipo de Conta</label>
                        <select
                          value={manualType}
                          onChange={e => setManualType(e.target.value as 'checking' | 'savings' | 'cash')}
                          className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-slate-600 dark:focus:border-slate-400 bg-slate-50 dark:bg-slate-800 dark:text-white cursor-pointer"
                        >
                          <option value="checking">Conta Corrente</option>
                          <option value="savings">Poupança</option>
                          <option value="cash">Dinheiro Físico</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saldo Atual (R$)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xs font-bold">R$</span>
                          <input 
                            type="number" 
                            step="0.01"
                            required 
                            placeholder="0,00"
                            value={manualBalance}
                            onChange={e => setManualBalance(e.target.value)}
                            className="w-full text-xs font-bold font-mono pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-slate-600 dark:focus:border-slate-400 bg-slate-50 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ícone Identificador</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'Smartphone', label: 'Digital', icon: <Smartphone className="w-4 h-4" /> },
                          { id: 'Coins', label: 'Físico', icon: <Coins className="w-4 h-4" /> },
                          { id: 'Building', label: 'Banco', icon: <Building className="w-4 h-4" /> }
                        ].map(item => {
                          const isSelected = manualIcon === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setManualIcon(item.id)}
                              className={`py-1.5 rounded-lg border text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-slate-700 dark:border-slate-300 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-extrabold shadow-sm' 
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cor de Destaque</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      {PRESET_COLORS.map(color => {
                        const isSelected = manualColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setManualColor(color)}
                            className="w-6 h-6 rounded-full transition-transform hover:scale-110 flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600 shadow-sm cursor-pointer"
                            style={{ backgroundColor: color }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[3.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      type="button" 
                      onClick={() => setActiveStep('list')}
                      className="flex-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-slate-800/10"
                    >
                      {activeStep === 'manual_edit' ? 'Salvar Edição' : 'Criar Conta'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM EXCLUDE MODAL */}
      <AnimatePresence>
        {accountToDelete && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base font-display">Excluir Conta Bancária</h3>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tem certeza que deseja excluir a conta <strong>{accountToDelete.name}</strong>? Todo o saldo associado a ela será removido.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setAccountToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteManualAccountConfirm}
                  className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-rose-600 hover:bg-rose-500 py-2.5 rounded-xl transition-colors cursor-pointer text-center shadow-lg shadow-rose-500/15"
                >
                  Excluir Conta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
