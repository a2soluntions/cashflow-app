const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

content = content.replace(/const rawBudgets = localStorage\.getItem\('vittacash_pro_budgets'\);/, '');
content = content.replace(/const budgetGoals: BudgetGoal\[\] = rawBudgets \? JSON\.parse\(rawBudgets\) : \[\];/, '');

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
