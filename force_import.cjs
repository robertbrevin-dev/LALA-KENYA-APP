const fs = require('fs');
let c = fs.readFileSync('src/app/routes.tsx', 'utf8');
c = "import RoleSelect from './pages/RoleSelect';\n" + c;
fs.writeFileSync('src/app/routes.tsx', c);
console.log('done');
