const fs = require('fs');

// Fix routes - remove HostResources import if broken, use HelpCenter temporarily
let routes = fs.readFileSync('src/app/routes.tsx', 'utf8');
console.log('HostResources in routes:', routes.includes('HostResources'));
console.log('HostResources file exists:', fs.existsSync('src/app/pages/HostResources.tsx'));
