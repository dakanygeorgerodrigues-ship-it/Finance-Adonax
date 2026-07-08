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
  Info,
  FileDown
} from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';

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

  const [year, monthNum] = currentMonth.split('-');
  const monthNamesPtFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const fullMonthLabel = `${monthNamesPtFull[parseInt(monthNum) - 1]} de ${year}`;

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const monthLabel = monthNamesPtFull[parseInt(monthNum) - 1];
      const periodText = `${monthLabel} de ${year}`;
      const docDate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let pageCount = 1;

      // Header Helper
      const drawHeader = (pageNum: number) => {
        // Top accent bar
        doc.setFillColor(30, 41, 59); // slate-800
        doc.rect(15, 12, 180, 2, 'F');

        // Brand name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('ADONAX Finance PRO', 15, 22);

        // Document subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('CONTROLE FINANCEIRO INTELIGENTE', 15, 27);

        // Period right-aligned
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`Período: ${periodText.toUpperCase()}`, 195, 22, { align: 'right' });

        // Generation date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Gerado em: ${docDate}`, 195, 27, { align: 'right' });

        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(15, 31, 195, 31);
      };

      // Footer Helper
      const drawFooter = (pageNum: number) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          'Adonax Finance PRO - Relatório de Uso Pessoal',
          15,
          285
        );
        doc.text(
          `Página ${pageNum}`,
          195,
          285,
          { align: 'right' }
        );
      };

      // Initialize Page 1
      drawHeader(pageCount);

      let y = 40;

      // --- SECTION 1: RESUMO DO PERÍODO ---
      doc.setFillColor(248, 250, 252); // Soft light background slate-50
      doc.rect(15, y, 180, 26, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('RESUMO FINANCEIRO DO MÊS', 20, y + 6);

      // Key Metrics
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Receitas do Mês:', 20, y + 13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(formatCurrency(totalIncome), 52, y + 13);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Despesas do Mês:', 20, y + 19);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68); // rose-600
      doc.text(formatCurrency(totalExpense), 52, y + 19);

      // Net savings
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Saldo Sobrante:', 110, y + 13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(netSavings >= 0 ? 13 : 225, netSavings >= 0 ? 148 : 29, netSavings >= 0 ? 136 : 72); // teal-600 or rose-600
      doc.text(formatCurrency(netSavings), 140, y + 13);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Taxa de Poupança:', 110, y + 19);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`${savingsRate}% da renda economizada`, 142, y + 19);

      y += 34;

      // --- SECTION 2: DESPESAS POR CATEGORIA ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('DESPESAS POR CATEGORIA', 15, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, y + 2, 195, y + 2);

      y += 7;

      if (pieDataWithPercentage.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Nenhuma despesa registrada neste período.', 15, y);
        y += 10;
      } else {
        // Draw category table header
        doc.setFillColor(241, 245, 249);
        doc.rect(15, y, 180, 6, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('CATEGORIA', 18, y + 4.5);
        doc.text('VALOR GASTO', 120, y + 4.5, { align: 'right' });
        doc.text('PARTICIPAÇÃO %', 190, y + 4.5, { align: 'right' });

        y += 6;

        pieDataWithPercentage.forEach((item) => {
          // Check page space
          if (y > 260) {
            drawFooter(pageCount);
            doc.addPage();
            pageCount++;
            drawHeader(pageCount);
            y = 40;
            // Redraw table header on new page
            doc.setFillColor(241, 245, 249);
            doc.rect(15, y, 180, 6, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text('CATEGORIA', 18, y + 4.5);
            doc.text('VALOR GASTO', 120, y + 4.5, { align: 'right' });
            doc.text('PARTICIPAÇÃO %', 190, y + 4.5, { align: 'right' });
            y += 6;
          }

          // Row line
          doc.setDrawColor(241, 245, 249);
          doc.line(15, y + 6, 195, y + 6);

          // Content
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(51, 65, 85);
          doc.text(item.name, 18, y + 4.5);
          doc.text(formatCurrency(item.value), 120, y + 4.5, { align: 'right' });
          doc.setFont('helvetica', 'bold');
          doc.text(`${item.percentage}%`, 190, y + 4.5, { align: 'right' });

          y += 6;
        });

        // Category total row
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text('TOTAL DE DESPESAS', 18, y + 4.5);
        doc.text(formatCurrency(totalPieExpense), 120, y + 4.5, { align: 'right' });
        doc.text('100%', 190, y + 4.5, { align: 'right' });

        y += 12;
      }

      // --- SECTION 3: LISTA DE LANÇAMENTOS DO MÊS ---
      // Check page space
      if (y > 230) {
        drawFooter(pageCount);
        doc.addPage();
        pageCount++;
        drawHeader(pageCount);
        y = 40;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('HISTÓRICO DETALHADO DE LANÇAMENTOS', 15, y);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(15, y + 2, 195, y + 2);

      y += 7;

      const sortedTxs = [...currentMonthTransactions].sort((a, b) => b.date.localeCompare(a.date));

      if (sortedTxs.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text('Nenhum lançamento encontrado neste período.', 15, y);
        y += 10;
      } else {
        // Draw transactions table header
        doc.setFillColor(241, 245, 249);
        doc.rect(15, y, 180, 6, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('DATA', 18, y + 4.5);
        doc.text('DESCRIÇÃO', 38, y + 4.5);
        doc.text('CATEGORIA', 105, y + 4.5);
        doc.text('STATUS', 148, y + 4.5, { align: 'center' });
        doc.text('VALOR', 190, y + 4.5, { align: 'right' });

        y += 6;

        sortedTxs.forEach((tx) => {
          // Check page space
          if (y > 260) {
            drawFooter(pageCount);
            doc.addPage();
            pageCount++;
            drawHeader(pageCount);
            y = 40;
            // Redraw table header
            doc.setFillColor(241, 245, 249);
            doc.rect(15, y, 180, 6, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text('DATA', 18, y + 4.5);
            doc.text('DESCRIÇÃO', 38, y + 4.5);
            doc.text('CATEGORIA', 105, y + 4.5);
            doc.text('STATUS', 148, y + 4.5, { align: 'center' });
            doc.text('VALOR', 190, y + 4.5, { align: 'right' });
            y += 6;
          }

          // Row line
          doc.setDrawColor(241, 245, 249);
          doc.line(15, y + 6, 195, y + 6);

          // Format Date (YYYY-MM-DD -> DD/MM)
          const [,, dayPart] = tx.date.split('-');
          const dateLabel = `${dayPart}/${monthNum}`;

          // Format status
          const statusLabel = tx.status === 'paid' ? 'Efetivado' : 'Pendente';

          // Get category name
          const catName = categories.find(c => c.id === tx.category)?.name || 'Sem Categoria';

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);

          // Draw Row values
          doc.text(dateLabel, 18, y + 4.5);
          
          // Truncate description to fit nicely
          const rawDesc = tx.description || 'Lançamento';
          const truncatedDesc = rawDesc.length > 32 ? rawDesc.slice(0, 30) + '..' : rawDesc;
          doc.text(truncatedDesc, 38, y + 4.5);
          
          doc.text(catName, 105, y + 4.5);

          // Status with colored text
          doc.setFont('helvetica', tx.status === 'paid' ? 'normal' : 'bold');
          doc.setTextColor(tx.status === 'paid' ? 100 : 217, tx.status === 'paid' ? 116 : 119, tx.status === 'paid' ? 139 : 6);
          doc.text(statusLabel, 148, y + 4.5, { align: 'center' });

          // Amount with colored text
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(tx.type === 'income' ? 16 : 225, tx.type === 'income' ? 185 : 29, tx.type === 'income' ? 129 : 72);
          const prefix = tx.type === 'income' ? '+' : '-';
          doc.text(`${prefix} ${formatCurrency(tx.amount)}`, 190, y + 4.5, { align: 'right' });

          y += 6;
        });
      }

      // Final signature on the last page if space allows, otherwise on a new page or slightly moved
      if (y > 250) {
        drawFooter(pageCount);
        doc.addPage();
        pageCount++;
        drawHeader(pageCount);
        y = 40;
      }

      // Decorative end line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, y + 5, 195, y + 5);

      // Final disclaimer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Este relatório é gerado automaticamente a partir dos lançamentos inseridos e sincronizados no Adonax Finance PRO.',
        15,
        y + 10
      );
      doc.text(
        'Fique firme nos seus objetivos financeiros! Use os recursos de planejamento e faturamento com sabedoria.',
        15,
        y + 14
      );

      drawFooter(pageCount);

      // Save File
      const filename = `Relatorio-Financeiro-${currentMonth}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('[Export PDF Error]', err);
      alert('Não foi possível exportar o PDF. Por favor, tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho de Relatórios com Exportação de PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/5 dark:bg-white/5 rounded-2xl p-5 border border-slate-900/10 dark:border-white/10" id="reports-header-section">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <Activity className="w-5 h-5 text-indigo-500 dark:text-cyan-400" /> Relatório Financeiro Mensal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
            Resumos, análise de faturamento por categoria e listagem consolidada do período de <span className="text-indigo-600 dark:text-cyan-300 font-bold">{fullMonthLabel}</span>.
          </p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 cursor-pointer active:scale-95 shrink-0"
          id="btn-export-pdf-report"
        >
          <FileDown className="w-4 h-4 text-white" />
          <span>Salvar PDF Mensal</span>
        </button>
      </div>
      
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
