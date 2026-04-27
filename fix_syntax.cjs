const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

const target = `  <Gauge \n  value={financialData.healthScore}`;
const replacement = `  ))}
 </div>
 </div>
 </div>
 </div>

 {/* 4. ÁREA: 4 VELOCÍMETROS */}
 <div className="shrink-0 h-auto md:h-[120px] grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
  <Gauge \n  value={financialData.healthScore}`;

content = content.replace(target, replacement);

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
