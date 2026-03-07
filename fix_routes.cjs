const fs = require('fs');
let c = fs.readFileSync('src/app/routes.tsx', 'utf8');
if (c.includes('RoleSelect')) {
  console.log('already added');
} else {
  c = c.replace(
    "import Signup from './pages/Signup';",
    "import Signup from './pages/Signup';\nimport RoleSelect from './pages/RoleSelect';"
  );
  c = c.replace(
    "{ index: true, Component: Splash },",
    "{ index: true, Component: Splash },\n      { path: 'role/:mode', Component: RoleSelect },"
  );
  fs.writeFileSync('src/app/routes.tsx', c);
  console.log('done');
}
