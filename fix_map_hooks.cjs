const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Map.tsx', 'utf8');
// Remove the early return before hooks
c = c.replace('if (loading) return null;\n  const propList = properties.map', 'const propList = properties.map');
fs.writeFileSync('src/app/pages/Map.tsx', c);
console.log('done');
