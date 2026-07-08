const fs = require('fs');
const content = fs.readFileSync('src/components/GuidedTour.tsx', 'utf8');

// 1. Add states for card
let newContent = content.replace(
  "const [accountBalance, setAccountBalance] = useState('');",
  "const [accountBalance, setAccountBalance] = useState('');\n  const [cardName, setCardName] = useState('');\n  const [cardLimit, setCardLimit] = useState('');"
);

// 2. Add handleSaveCard and change step limit
newContent = newContent.replace(
  /if \(step < 4\) {/,
  "if (step < 5) {"
);

newContent = newContent.replace(
  /const handleSaveTransaction = \(\) => {/,
  `const handleSaveCard = () => {
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

  const handleSaveTransaction = () => {`
);

// 3. Update Progress Bar
newContent = newContent.replace(
  /\{\[1, 2, 3, 4\]\.map\(i => \(/,
  "{[1, 2, 3, 4, 5].map(i => ("
);
newContent = newContent.replace(
  /Passo \{step\} de 4/,
  "Passo {step} de 5"
);

// 4. Update Steps content conditions
newContent = newContent.replace(/\{step === 4 && \(/g, "{step === 5 && (");
newContent = newContent.replace(/\{step === 3 && \(/g, "{step === 4 && (");
newContent = newContent.replace(/\{step === 2 && \(/g, "{step === 3 && (");

// 5. Insert Step 2 (Card)
newContent = newContent.replace(
  /\{step === 3 && \(/,
  `{step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                    <Wallet className="w-8 h-8" />
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

            {step === 3 && (`
);

fs.writeFileSync('src/components/GuidedTour.tsx', newContent, 'utf8');
console.log('Successfully updated GuidedTour');
