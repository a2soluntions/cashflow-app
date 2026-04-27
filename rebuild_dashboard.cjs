const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// 1. EXTRACT BLOCKS
const s2Start = '{/* 2. CARDS SUPERIORES */}';
const s2End = '  {/* 3. CONTEÚDO PRINCIPAL';
const s2Index = content.indexOf(s2Start);
const s2EndIndex = content.indexOf(s2End);
const section2 = content.substring(s2Index, s2EndIndex);

const s4Start = '{/* 4. ÁREA: 4 VELOCÍMETROS */}';
const s4End = '  </div>\n\n  </div>\n  );\n}'; // End of the return block
const s4Index = content.indexOf(s4Start);
const s4EndIndex = content.indexOf(s4End) + 9; // Include the first closing </div>
const section4 = content.substring(s4Index, s4EndIndex);

// Monitor de Metas block
const monitorStartMarker = '<Target size={18} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Monitor de Metas</span>';
const monitorContainerStart = content.lastIndexOf('<div className="flex-1 p-5', content.indexOf(monitorStartMarker));
const monitorContainerEnd = content.indexOf('</div>\n  </div>', monitorContainerStart) + 14;
const monitorContainer = content.substring(monitorContainerStart, monitorContainerEnd);

// Inner mapping logic of monitor
const monitorMapLogic = content.substring(
    content.indexOf('{financialData.budgetStatus.length === 0 ? (', monitorContainerStart),
    content.indexOf('))}', monitorContainerStart) + 3
);

// 2. CONSTRUCT NEW TOP SECTIONS
const horizontalMonitor = `
  {/* MONITOR DE METAS (HORIZONTAL) */}
  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar shrink-0 mb-4 bg-white/5 p-4 rounded-2xl">
    <div className="flex flex-col shrink-0 border-r border-white/10 pr-4 mr-2">
      <div className="flex items-center gap-2 text-slate-400">
        <Target size={14} className="text-emerald-500"/><span className="text-[10px] font-black uppercase tracking-widest">Metas por Categoria</span>
      </div>
      <p className="text-[8px] font-bold text-slate-500 uppercase">Acompanhamento de Teto</p>
    </div>
    <div className="flex gap-4 min-w-0">
      ${monitorMapLogic.replace(/p-3 rounded-2xl/g, 'p-3 rounded-xl w-48 shrink-0')}
    </div>
  </div>
`;

const updatedSection4 = section4
    .replace('gap-4 mt-2', 'gap-3 mb-4')
    .replace('h-auto md:h-[120px]', 'h-auto md:h-[110px]');

const updatedSection2 = section2
    .replace('gap-6 shrink-0 mb-4', 'gap-4 shrink-0 mb-4')
    .replace('pb-4 transition-all', 'pb-2 transition-all');

// 3. REASSEMBLE
// Remove Section 4 from bottom
content = content.replace(section4, '');
// Remove old monitor from main grid
content = content.replace(monitorContainer, '');

// Insert everything after Header
const headerEnd = '  {/* 1. TOP HEADER */}';
const headerBlockEnd = content.indexOf('</div>', content.indexOf(headerEnd)) + 6;
const afterHeader = content.substring(headerBlockEnd);

const newBody = horizontalMonitor + '\n\n  ' + updatedSection4 + '\n\n  ' + updatedSection2 + '\n\n  ' + afterHeader;

content = content.substring(0, headerBlockEnd) + '\n\n  ' + newBody;

// Final cleanup of the main wrapper gap
content = content.replace('flex flex-col gap-6 font-sans', 'flex flex-col gap-4 font-sans');

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
