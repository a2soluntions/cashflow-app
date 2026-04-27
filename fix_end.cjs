const fs = require('fs');
const filepath = 'e:/A2soluntions/projetos/VittaCash/src/components/DashboardHome.tsx';
let content = fs.readFileSync(filepath, 'utf-8');

// The last map is on line 480
const lastMapEnd = content.lastIndexOf('))}');
const finalPart = `))}
    </div>
  </div>
 </div>
 </div>
 </div>
 );
}
`;

content = content.substring(0, lastMapEnd) + finalPart;

fs.writeFileSync(filepath, content, 'utf-8');
console.log('done');
