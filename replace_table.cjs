const fs = require('fs');
const content = fs.readFileSync('src/components/TransactionsList.tsx', 'utf8');

const regex = /(<div className="overflow-x-auto">\s*<table className="w-full text-left border-collapse">[\s\S]*?<\/table>\s*<\/div>)/;

const newContent = `
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
$1
              </table>
            </div>
            
            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-900/5 dark:divide-white/5">
              {filteredTransactions.map(t => {
                const category = getCategoryDetails(t.category);
                const isExpense = t.type === 'expense';
                const isSelected = selectedIds.includes(t.id);
                
                return (
                  <div key={t.id} className={\`p-4 transition-all duration-150 \${isSelected ? 'bg-teal-500/10' : ''}\`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-start gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectToggle(t.id)}
                          className="rounded border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer w-4 h-4 mt-1"
                          id={\`tx-mobile-checkbox-\${t.id}\`}
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
                      <div className={\`text-right font-extrabold text-sm font-display whitespace-nowrap \${isExpense ? 'text-rose-400' : 'text-teal-300'}\`}>
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
                          className={\`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all border \${
                            t.status === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }\`}
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
`;

// Extract table content
const match = content.match(regex);
if (match) {
  const tableWrapperContent = match[1];
  const innerTableContentMatch = tableWrapperContent.match(/<table className="w-full text-left border-collapse">([\s\S]*?)<\/table>/);
  if (innerTableContentMatch) {
      const innerTableContent = innerTableContentMatch[1];
      const result = content.replace(regex, newContent.replace('$1', innerTableContent));
      fs.writeFileSync('src/components/TransactionsList.tsx', result, 'utf8');
      console.log('Successfully replaced.');
  } else {
    console.log('Failed to match inner table content');
  }
} else {
  console.log('Failed to match outer div');
}
