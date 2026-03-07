const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Map.tsx', 'utf8');

// Fix 1: Remove const L = L lines
c = c.replace(/^\s*const L = L;\n/gm, '');

// Fix 2: Remove orphaned div from tab switcher
c = c.replace(
  '<div className="flex gap-1.5">\n              <div>\n              <button\n                onClick={() => setIsDark(v => !v)}',
  '<div className="flex gap-1.5">\n              <button\n                onClick={() => setIsDark(v => !v)}'
);

// Fix 3: Lock panel to guest
c = c.replace("const [panel, setPanel] = useState<'guest' | 'host'>('guest');", "const panel = 'guest';");
c = c.replace(/setPanel\([^)]*\);?/g, '');

// Fix 4: Add loading to useApp
c = c.replace("const { properties, currentUser } = useApp();", "const { properties, currentUser, loading } = useApp();");

// Fix 5: Loading guard
if (!c.includes('if (loading) return null;')) {
  c = c.replace('const propList = properties.map', 'if (loading) return null;\n  const propList = properties.map');
}

// Fix 6: Remove host panel JSX
const hostStart = c.indexOf("{panel === 'host' && !navigating && (");
if (hostStart > -1) {
  const before = c.substring(0, hostStart);
  const after = c.substring(hostStart);
  const endMarker = '</AnimatePresence>';
  const endIdx = after.indexOf(endMarker);
  if (endIdx > -1) {
    c = before + after.substring(endIdx + endMarker.length);
    console.log('Host panel removed');
  }
}

// Fix 7: Balance AnimatePresence tags
const apOpen = (c.match(/<AnimatePresence/g) || []).length;
const apClose = (c.match(/<\/AnimatePresence>/g) || []).length;
if (apOpen > apClose) {
  c = c.replace(
    '        </AnimatePresence>\n\n        {userPos && (',
    '        </AnimatePresence>\n        </AnimatePresence>\n\n        {userPos && ('
  );
}

fs.writeFileSync('src/app/pages/Map.tsx', c);
const ap2 = (c.match(/<AnimatePresence/g) || []).length;
const ac2 = (c.match(/<\/AnimatePresence>/g) || []).length;
console.log('Done! AP balance:', ap2, '/', ac2, '| setPanel:', (c.match(/setPanel/g)||[]).length);
