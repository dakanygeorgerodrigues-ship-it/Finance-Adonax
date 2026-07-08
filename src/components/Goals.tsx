/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Goal } from '../types';
import { 
  Plus, 
  Trash2, 
  X, 
  TrendingUp, 
  Calendar, 
  PiggyBank, 
  ChevronRight, 
  Check,
  PlusCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (g: Omit<Goal, 'id'>) => void;
  onEditGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export default function Goals({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal
}: GoalsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10B981');

  // Estado para Contribuições/Resgates
  const [activeActionGoal, setActiveActionGoal] = useState<{ id: string; type: 'deposit' | 'withdraw' } | null>(null);
  const [actionAmount, setActionAmount] = useState('');
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const PRESET_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4'];

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount) return;

    if (editingGoal) {
      onEditGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline || undefined,
        color
      });
    } else {
      onAddGoal({
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount) || 0,
        deadline: deadline || undefined,
        color
      });
    }

    // Resetar
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setColor('#10B981');
    setEditingGoal(null);
    setIsOpen(false);
  };

  const handleGoalAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionGoal || !actionAmount) return;

    const goal = goals.find(g => g.id === activeActionGoal.id);
    if (!goal) return;

    const amount = parseFloat(actionAmount);
    let newCurrent = goal.currentAmount;

    if (activeActionGoal.type === 'deposit') {
      newCurrent += amount;
    } else {
      newCurrent = Math.max(0, newCurrent - amount);
    }

    onEditGoal(goal.id, { currentAmount: newCurrent });
    
    setActionAmount('');
    setActiveActionGoal(null);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sem prazo';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho de Metas */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <PiggyBank className="w-5.5 h-5.5 text-teal-600" /> Minhas Metas de Poupança
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
            Crie objetivos financeiros, poupe dinheiro regularmente e acompanhe o percentual acumulado. Mantenha o foco em seus sonhos!
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingGoal(null);
            setName('');
            setTargetAmount('');
            setCurrentAmount('');
            setDeadline('');
            setColor('#10B981');
            setIsOpen(true);
          }}
          className="bg-teal-600 hover:bg-teal-700 text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          id="open-add-goal-modal"
        >
          <Plus className="w-4.5 h-4.5" /> Nova Meta
        </button>
      </div>

      {/* Lista de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 col-span-full space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-600 dark:text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600 text-sm">Nenhuma meta cadastrada</p>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              Crie uma meta como reserva de emergência, viagem ou aquisição de bens para começar a economizar.
            </p>
          </div>
        ) : (
          goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            
            return (
              <motion.div 
                key={goal.id}
                layout
                className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Título e Excluir/Editar */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-3.5 h-3.5 rounded-full block shrink-0" style={{ backgroundColor: goal.color }}></span>
                      <span className="font-bold text-slate-800 text-base line-clamp-1">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingGoal(goal);
                          setName(goal.name);
                          setTargetAmount(goal.targetAmount.toString());
                          setCurrentAmount(goal.currentAmount.toString());
                          setDeadline(goal.deadline || '');
                          setColor(goal.color);
                          setIsOpen(true);
                        }}
                        className="text-slate-500 dark:text-slate-400 hover:text-teal-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Editar Meta"
                        id={`edit-goal-btn-${goal.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setGoalToDelete(goal)}
                        className="text-slate-500 dark:text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        title="Excluir Meta"
                        id={`delete-goal-btn-${goal.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progresso Visual e Numérico */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progresso Geral</span>
                      <span className="text-slate-700">{percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-slate-500 dark:text-slate-400">de {formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>

                  {/* Informações Auxiliares */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Prazo: {formatDate(goal.deadline)}
                    </span>
                    {isCompleted && (
                      <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Concluída!
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação de Meta (Depósito, Resgate) */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => setActiveActionGoal({ id: goal.id, type: 'deposit' })}
                    className="flex items-center justify-center gap-1 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-700 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer"
                    id={`deposit-goal-trigger-${goal.id}`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Guardar
                  </button>
                  <button 
                    onClick={() => setActiveActionGoal({ id: goal.id, type: 'withdraw' })}
                    disabled={goal.currentAmount === 0}
                    className="flex items-center justify-center gap-1 border border-slate-200 hover:border-amber-200 hover:bg-amber-50/50 text-slate-500 hover:text-amber-700 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                    id={`withdraw-goal-trigger-${goal.id}`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" /> Resgatar
                  </button>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

      {/* --- MODAL PARA CRIAR OU EDITAR META --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-sm overflow-hidden"
              id="add-goal-modal"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-teal-600" /> {editingGoal ? 'Editar Meta de Poupança' : 'Nova Meta de Poupança'}
                </h3>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setEditingGoal(null);
                  }} 
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Qual é o seu objetivo?</label>
                  <input 
                    type="text"
                    required
                    placeholder="ex: Reserva de Emergência, Carro Novo..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-black text-sm font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    id="new-goal-name-input"
                  />
                </div>

                {/* Grid Duplo: Alvo e Atual */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Valor Alvo */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Valor Alvo (R$)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      placeholder="ex: 10000"
                      value={targetAmount}
                      onChange={e => setTargetAmount(e.target.value)}
                      className="w-full text-black text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      id="new-goal-target-input"
                    />
                  </div>

                  {/* Valor Já Salvo */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Já tenho salvo (R$)</label>
                    <input 
                      type="number"
                      min="0"
                      placeholder="ex: 1500"
                      value={currentAmount}
                      onChange={e => setCurrentAmount(e.target.value)}
                      className="w-full text-black text-xs font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      id="new-goal-current-input"
                    />
                  </div>
                </div>

                {/* Prazo Limite */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Data Limite (Prazo)</label>
                  <input 
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full text-black text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    id="new-goal-deadline-input"
                  />
                </div>

                {/* Seletor de Cor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Cor Identificadora</label>
                  <div className="flex gap-2 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6.5 h-6.5 rounded-full cursor-pointer border-2 transition-all ${
                          color === c ? 'border-slate-800 scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      ></button>
                    ))}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setEditingGoal(null);
                    }}
                    className="flex-1 text-xs font-bold text-slate-500 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 text-xs font-bold text-slate-900 dark:text-white bg-teal-600 hover:bg-teal-700 py-2.5 rounded-xl transition-colors cursor-pointer text-center"
                    id="save-new-goal-btn"
                  >
                    {editingGoal ? 'Salvar Alterações' : 'Criar Meta'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL PARA CONTRIBUIÇÕES/RESGATES --- */}
      <AnimatePresence>
        {activeActionGoal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 w-full max-w-sm overflow-hidden"
              id="goal-action-modal"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 text-base">
                  {activeActionGoal.type === 'deposit' ? 'Guardar Dinheiro na Meta' : 'Resgatar Dinheiro da Meta'}
                </h3>
                <button onClick={() => setActiveActionGoal(null)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGoalAction} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Valor do Lançamento (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="ex: 250,00"
                    value={actionAmount}
                    onChange={e => setActionAmount(e.target.value)}
                    className="w-full text-black text-sm font-bold px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    id="goal-action-amount-input"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => setActiveActionGoal(null)}
                    className="flex-1 text-xs font-bold text-slate-500 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className={`flex-1 text-xs font-bold text-slate-900 dark:text-white py-2.5 rounded-xl transition-colors cursor-pointer text-center ${
                      activeActionGoal.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                    id="save-goal-action-btn"
                  >
                    {activeActionGoal.type === 'deposit' ? 'Guardar' : 'Resgatar'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE GOAL MODAL */}
      <AnimatePresence>
        {goalToDelete && (
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-150 rounded-2xl w-full max-w-sm overflow-hidden p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="font-extrabold text-slate-800 text-base font-display">Excluir Meta</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tem certeza que deseja excluir a meta "{goalToDelete.name}"? Essa ação não poderá ser desfeita.
              </p>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setGoalToDelete(null)}
                  className="flex-1 text-xs font-bold text-slate-500 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    onDeleteGoal(goalToDelete.id);
                    setGoalToDelete(null);
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

    </div>
  );
}
