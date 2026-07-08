/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction, Category, Account } from '../types';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  HelpCircle, 
  Calendar,
  Layers,
  Activity,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface ReportsProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currentMonth: string; // "YYYY-MM"
}

export default function Reports({
  transactions,
  categories,
  accounts,
  currentMonth
}: ReportsProps) {
  const [selectedCategorySlice, setSelectedCategorySlice] = useState<string | null>(null);

  // 1. Filtrar lançamentos do mês selecionado
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  
  // 2. Fluxo Geral do Mês Selecionado
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // 3. Preparar Dados para Gráfico de Barras Mensal (Últimos 4 meses)
  // Vamos calcular dinamicamente os últimos 4 meses incluindo o atual
  const getLastMonths = (startMonthStr: string, count: number): string[] => {
    const list: string[] = [];
    let [year, month] = startMonthStr.split('-').map(Number);
    for (let i = 0; i < count; i++) {
      list.push(`${year}-${String(month).padStart(2, '0')}`);
      month--;
      if (month === 0) {
        month = 12;
        year--;
      }
    }
    return list.reverse();
  };

  const recentMonths = getLastMonths(currentMonth, 4);
  const monthNamesPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const barChartData = recentMonths.map(m => {
    const [year, monthNum] = m.split('-');
    const label = `${monthNamesPt[parseInt(monthNum) - 1]} / ${year.slice(2)}`;
    
    const monthTxs = transactions.filter(t => t.date.startsWith(m) && t.status === 'paid');
    const income = monthTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: label,
      Receitas: parseFloat(income.toFixed(2)),
      Despesas: parseFloat(expense.toFixed(2))
    };
  });

  // 4. Preparar Dados para Gráfico de Rosca de Despesas por Categoria
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  const categoryPieDataRaw = expenseCategories.map(cat => {
    const spent = currentMonthTransactions
      .filter(t => t.category === cat.id && t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      id: cat.id,
      name: cat.name,
      value: parseFloat(spent.toFixed(2)),
      color: cat.color
    };
  });

  // Filtrar apenas categorias com gastos maiores que zero
  const categoryPieData = categoryPieDataRaw.filter(item => item.value > 0);

  // Calcular porcentagem para cada categoria
  const totalPieExpense = categoryPieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithPercentage = categoryPieData.map(item => ({
    ...item,
    percentage: totalPieExpense > 0 ? Math.round((item.value / totalPieExpense) * 100) : 0
  })).sort((a, b) => b.value - a.value);

  // 5. Preparar Dados para Gráfico de Evolução de Gastos Diários (Linha/Área)
  // Criar array de todos os dias do mês atual (1 a 31 ou 30, etc.)
  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const daysCount = getDaysInMonth(currentMonth);
  let cumulativeSpending = 0;

  const areaChartData = Array.from({ length: daysCount }, (_, i) => {
    const day = i + 1;
    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
    
    // Gastos nesse dia específico
    const daySpent = currentMonthTransactions
      .filter(t => t.date === dateStr && t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    cumulativeSpending += daySpent;

    return {
      dia: day,
      'Gasto Diário': parseFloat(daySpent.toFixed(2)),
      'Acumulado': parseFloat(cumulativeSpending.toFixed(2))
    };
  });

  // Formatar Moeda Brasileira
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Formatar Tooltip dos Gráficos
  const customTooltipFormatter = (value: any) => {
    if (typeof value === 'number') {
      return [formatCurrency(value), ''];
    }
    return [value, ''];
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Cards de Indicadores de Desempenho do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Receitas Totais */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className="bg-emerald-500/10 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">RECEITAS DO MÊS</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 select-all">{formatCurrency(totalIncome)}</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Lançamentos efetivados</span>
          </div>
        </motion.div>

        {/* Despesas Totais */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className="bg-rose-500/10 p-3 rounded-xl">
            <TrendingDown className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">DESPESAS DO MÊS</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 select-all">{formatCurrency(totalExpense)}</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Lançamentos pagos</span>
          </div>
        </motion.div>

        {/* Taxa de Poupança */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white border border-slate-900/10 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${netSavings >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold tracking-wide uppercase">SALDO SOBRANTE</span>
            <h3 className={`text-xl font-bold mt-0.5 select-all ${netSavings >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {formatCurrency(netSavings)}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {netSavings >= 0 ? `Economizou ${savingsRate}% da renda` : 'Gastos superaram receitas'}
            </span>
          </div>
        </motion.div>

      </div>

      {/* Grid Principal: Gráfico de Rosca de Gastos e Comparativo de Meses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Despesas por Categoria (Rosca) */}
        <div className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl border border-slate-900/10 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
              <Layers className="w-4.5 h-4.5 text-teal-400" /> Despesas por Categoria
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gráfico Dinâmico</span>
          </div>

          {pieDataWithPercentage.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 space-y-2">
              <Layers className="w-10 h-10 text-slate-600 dark:text-slate-300" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nenhum gasto registrado neste mês</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Rosca com Recharts */}
              <div className="h-[220px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDataWithPercentage}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setSelectedCategorySlice(pieDataWithPercentage[index].id)}
                      onMouseLeave={() => setSelectedCategorySlice(null)}
                    >
                      {pieDataWithPercentage.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={selectedCategorySlice === null || selectedCategorySlice === entry.id ? 1 : 0.6}
                          style={{ outline: 'none', cursor: 'pointer' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={customTooltipFormatter} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Texto Central da Rosca */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total de Gastos</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white select-all">{formatCurrency(totalPieExpense)}</span>
                </div>
              </div>

              {/* Lista/Legenda de Porcentagens */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {pieDataWithPercentage.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex justify-between items-center p-1.5 rounded-lg transition-colors ${
                      selectedCategorySlice === item.id ? 'bg-slate-50' : ''
                    }`}
                    onMouseEnter={() => setSelectedCategorySlice(item.id)}
                    onMouseLeave={() => setSelectedCategorySlice(null)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[100px] sm:max-w-[120px]">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{formatCurrency(item.value)}</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">{item.percentage}% do total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Gráfico 2: Evolução de Gastos Acumulados no Mês (Área) */}
        <div className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl border border-slate-900/10 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-teal-400" /> Evolução Diária de Gastos
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Acumulado do Mês</span>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dia" stroke="#94A3B8" fontSize={10} tickLine={false} label={{ value: 'Dias do Mês', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94A3B8' }} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip formatter={customTooltipFormatter} labelFormatter={(label) => `Dia ${label}`} />
                <Area type="monotone" dataKey="Acumulado" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAcumulado)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-normal font-medium bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <Info className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
            Esta curva mostra o acúmulo das suas despesas efetivadas no decorrer do mês de {monthNamesPt[parseInt(currentMonth.split('-')[1]) - 1]}. Mantenha a curva o mais estável possível!
          </p>
        </div>

      </div>

      {/* Gráfico 3: Histórico de Fluxo de Caixa Recente (Barras Lado a Lado) */}
      <div className="glass border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl border border-slate-900/10 dark:border-white/10 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-teal-400" /> Fluxo de Caixa Histórico (Últimos 4 Meses)
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Receitas vs Despesas</span>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={barChartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip formatter={customTooltipFormatter} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.5rem' }} itemStyle={{ color: '#fff' }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={45} />
              <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
