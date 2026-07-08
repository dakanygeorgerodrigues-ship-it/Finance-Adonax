import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# First, extract the two blocks.
# Block 1 (currently BALANÇO MENSAL)
#          <div>
#            <p className="text-teal-300 text-xs font-bold tracking-wider uppercase opacity-90">BALANÇO MENSAL</p>
#            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight select-all font-display ${monthlyBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
#              {formatCurrency(monthlyBalance)}
#            </h2>
#          </div>

# Block 2 (currently SALDO GERAL)
#          <div>
#            <p className="text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
#              <Coins className="w-3.5 h-3.5 text-amber-400" /> SALDO GERAL
#            </p>
#            <p className="text-base sm:text-xl font-black mt-1 select-all font-display text-white">
#              {formatCurrency(totalBalance)}
#            </p>
#          </div>

old_block1 = """          <div>
            <p className="text-teal-300 text-xs font-bold tracking-wider uppercase opacity-90">BALANÇO MENSAL</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight select-all font-display ${monthlyBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(monthlyBalance)}
            </h2>
          </div>"""

old_block2 = """          <div>
            <p className="text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> SALDO GERAL
            </p>
            <p className="text-base sm:text-xl font-black mt-1 select-all font-display text-white">
              {formatCurrency(totalBalance)}
            </p>
          </div>"""

# Now, we swap and adjust text
# The top block should be SALDO ATUAL with totalBalance
new_block1 = """          <div>
            <p className="text-teal-300 text-xs font-bold tracking-wider uppercase opacity-90">SALDO ATUAL</p>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight select-all font-display ${totalBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(totalBalance)}
            </h2>
          </div>"""

# The bottom block should be BALANÇO MENSAL with monthlyBalance
new_block2 = """          <div>
            <p className="text-slate-300 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 uppercase tracking-wide">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> BALANÇO MENSAL
            </p>
            <p className="text-base sm:text-xl font-black mt-1 select-all font-display text-white">
              {formatCurrency(monthlyBalance)}
            </p>
          </div>"""

content = content.replace(old_block1, new_block1)
content = content.replace(old_block2, new_block2)

# We should also replace instances of "Saldo Geral" with "Saldo Atual" in the edit balance modal text just to be thorough and consistent.
content = content.replace("Saldo Geral", "Saldo Atual")

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
