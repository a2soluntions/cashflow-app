const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// 1. Extract "Monitor de Metas" logic
const monitorStart = '<div className="flex-1 p-5 bg-white dark:bg-[#09090b]/20 flex flex-col min-h-[200px] md:min-h-0 transition-all ">';
const monitorKey = '<Target size={18} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Monitor de Metas</span>';

// We need to find the block that contains monitorKey
const monitorBlockStart = content.lastIndexOf(monitorStart, content.indexOf(monitorKey));
// Find the closing div of this block. It's tricky.
// Let's assume it ends before Section 4 closing divs.
// Actually, let's use a simpler approach. I'll just cut the inner content and wrap it differently at the top.

const monitorInnerStart = content.indexOf('{financialData.budgetStatus.length === 0 ? (', monitorBlockStart);
const monitorInnerEnd = content.indexOf('))}', monitorInnerStart) + 3;
const monitorInnerContent = content.substring(monitorInnerStart, monitorInnerEnd);

// 2. Create the horizontal version
const horizontalMonitor = `
  {/* MONITOR DE METAS HORIZONTAL */}
  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 mb-4 bg-white/5 p-4 ">
    <div className="flex flex-col shrink-0 border-r border-white/10 pr-4 mr-2">
      <div className="flex items-center gap-2 text-slate-400">
        <Target size={14} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Monitor de Metas</span>
      </div>
      <p className="text-[8px] font-bold text-slate-500 uppercase">Orçamento por Categoria</p>
    </div>
    <div className="flex gap-4 min-w-0">
      ${monitorInnerContent.replace(/p-3 rounded-2xl/g, 'p-3 rounded-xl w-48 shrink-0')}
    </div>
  </div>
`;

// 3. Remove the old monitor block and its parent container in Section 3
// The old block was lines 419-450 roughly.
// I'll just replace the whole right column content with something else or keep the top part.

// Let's find the container of % Distribuição and Monitor de Metas
const rightColStart = '{/* COLUNA DIREITA */}';
const distributionStart = '<div className="shrink-0 h-[150px] p-5 bg-white dark:bg-[#09090b]/20 flex flex-col transition-all ">';
// We'll keep distribution but remove monitor.

const oldMonitorBlock = content.substring(monitorBlockStart, content.indexOf('</div>\n  </div>\n  </div>', monitorBlockStart) + 9);
content = content.replace(oldMonitorBlock, '');

// 4. Insert horizontal monitor after Header
const headerEnd = '{/* 1. TOP HEADER */}';
const headerBlockEnd = content.indexOf('</div>', content.indexOf(headerEnd)) + 6;
content = content.replace(headerEnd, headerEnd + horizontalMonitor);

// 5. Cleanup Vitta.tsx pass (ensure it passes categories)
// Done previously.

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
