const fs = require('fs');
let content = fs.readFileSync('src/components/GuidedTour.tsx', 'utf8');

content = content.replace(
  "import { Wallet, DollarSign, ListOrdered, TrendingUp, ArrowRight, X, SkipForward, Check } from 'lucide-react';",
  "import { Wallet, DollarSign, ListOrdered, TrendingUp, ArrowRight, X, SkipForward, Check, CreditCard } from 'lucide-react';"
);

// We want to replace the Wallet icon on step 2.
// Find `{step === 2 && (` block
const step2Index = content.indexOf('{step === 2 && (');
if (step2Index !== -1) {
  const nextWalletIndex = content.indexOf('<Wallet className="w-8 h-8" />', step2Index);
  if (nextWalletIndex !== -1) {
    content = content.substring(0, nextWalletIndex) + '<CreditCard className="w-8 h-8" />' + content.substring(nextWalletIndex + '<Wallet className="w-8 h-8" />'.length);
  }
}

fs.writeFileSync('src/components/GuidedTour.tsx', content, 'utf8');
