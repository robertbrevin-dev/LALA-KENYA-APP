const fs = require('fs');
let c = fs.readFileSync('src/app/pages/RoleSelect.tsx', 'utf8');
c = c.replace('<- Back', '&larr; Back');
c = c.replace(/>->/g, '>&#x2192;');
fs.writeFileSync('src/app/pages/RoleSelect.tsx', c);
console.log('done');
