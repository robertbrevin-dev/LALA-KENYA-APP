const fs = require('fs');
let c = fs.readFileSync('src/app/routes.tsx', 'utf8');
if (c.includes("import RoleSelect")) {
  console.log('already there');
} else {
  c = c.replace(
    "import Signup from './pages/Signup';",
    "import Signup from './pages/Signup';\nimport RoleSelect from './pages/RoleSelect';"
  );
  fs.writeFileSync('src/app/routes.tsx', c);
  console.log('done');
}
