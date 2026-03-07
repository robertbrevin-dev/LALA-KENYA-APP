const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Map.tsx', 'utf8');
c = c.replace(
  "    if (currentUser?.role === 'host') \n  }, [currentUser?.role]);",
  "    if (currentUser?.role === 'host') { navigate('/host/map'); }\n  }, [currentUser?.role]);"
);
fs.writeFileSync('src/app/pages/Map.tsx', c);
console.log('done');
