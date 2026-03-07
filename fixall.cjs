const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('grep -rl "if (typeof supabase" src/').toString().trim().split('\n');
files.forEach(f => {
  if (!f) return;
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/^if \(typeof supabase[^\n]*\n/, '');
  fs.writeFileSync(f, c);
  console.log('fixed:', f);
});
