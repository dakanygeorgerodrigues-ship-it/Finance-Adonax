const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/localStorage\.setItem\('org_accounts', JSON\.stringify\(updatedAccounts\)\);/g, "localStorage.setItem(getStorageKey('org_accounts'), JSON.stringify(updatedAccounts));");
content = content.replace(/localStorage\.setItem\('org_transactions', JSON\.stringify\(updatedTransactions\)\);/g, "localStorage.setItem(getStorageKey('org_transactions'), JSON.stringify(updatedTransactions));");

fs.writeFileSync('src/App.tsx', content, 'utf8');
