const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// 1. Identify Section 2 (Summary Cards)
const section2Start = '{/* 2. CARDS SUPERIORES */}';
const section2End = '</div>\n\n  {/* 3. CONTEÚDO PRINCIPAL';
const s2Index = content.indexOf(section2Start);
const s2EndIndex = content.indexOf(section2End) + 6; // +6 to include the closing </div>
const section2Content = content.substring(s2Index, s2EndIndex);

// 2. Identify Section 4 (Gauges)
const section4Start = '{/* 4. ÁREA: 4 VELOCÍMETROS */}';
const section4End = '</div>\n\n  </div>\n  );\n}';
const s4Index = content.indexOf(section4Start);
const s4EndIndex = content.indexOf(section4End) + 6;
const section4Content = content.substring(s4Index, s4EndIndex);

// 3. Remove Section 4 from the bottom
content = content.replace(section4Content, '');

// 4. Insert Section 4 before Section 2
content = content.replace(section2Start, section4Content + '\n\n  ' + section2Start);

// 5. Polish for "No Scrollbar" (reduce some gaps)
content = content.replace(/gap-6 shrink-0 mb-4/g, 'gap-4 shrink-0 mb-2'); // Summary cards gap
content = content.replace(/gap-4 mt-2/g, 'gap-3 mb-2'); // Gauges gap/margin
content = content.replace(/h-auto md:h-\[120px\]/g, 'h-auto md:h-[110px]'); // Reduce gauge height slightly
content = content.replace(/pb-4 transition-all/g, 'pb-2 transition-all'); // Summary card padding

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
