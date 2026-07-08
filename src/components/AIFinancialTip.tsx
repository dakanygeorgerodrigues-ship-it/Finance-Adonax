import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Transaction, Budget, Goal } from '../types';

interface AIFinancialTipProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
}

export default function AIFinancialTip({ transactions, budgets, goals }: AIFinancialTipProps) {
  const [tip, setTip] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const fetchTip = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch('/api/financial-tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions,
          budgets,
          goals
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tip');
      }

      const data = await response.json();
      setTip(data.tip);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch once on mount

  return (
    <div className="glass rounded-2xl border border-indigo-500/20 p-5 space-y-3 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
      <div className="flex justify-between items-center relative z-10">
        <h4 className="font-bold text-indigo-400 text-sm flex items-center gap-1.5">
          <Sparkles className="w-4.5 h-4.5" /> Dica de IA
        </h4>
        <button 
          onClick={fetchTip}
          disabled={loading}
          className="text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
          title="Nova Dica"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="relative z-10 min-h-[60px] flex items-center">
        {loading ? (
          <div className="w-full space-y-2">
            <div className="h-3 bg-slate-900/10 dark:bg-white/10 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-slate-900/10 dark:bg-white/10 rounded animate-pulse w-5/6"></div>
          </div>
        ) : error ? (
          <p className="text-xs text-rose-400">Não foi possível gerar uma dica no momento. Tente novamente mais tarde.</p>
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic leading-relaxed">
            "{tip}"
          </p>
        )}
      </div>
    </div>
  );
}
