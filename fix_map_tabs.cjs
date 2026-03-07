const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Map.tsx', 'utf8');

// Remove the entire guest/host tab switcher block
const start = c.indexOf('<div className="flex rounded-[10px] overflow-hidden"');
const end = c.indexOf('</div>', start) + '</div>'.length;
if (start > -1) {
  c = c.slice(0, start) + c.slice(end);
  console.log('Tab switcher removed');
}

fs.writeFileSync('src/app/pages/Map.tsx', c);
console.log('done');
