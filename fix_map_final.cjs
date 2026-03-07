const fs = require('fs');
let c = fs.readFileSync('src/app/pages/Map.tsx', 'utf8');

// Fix 1: Remove all const L = L lines
c = c.replace(/^\s*const L = L;\n/gm, '');

// Fix 2: Lock panel to guest always
c = c.replace(
  "const [panel, setPanel] = useState<'guest' | 'host'>('guest');",
  "const panel = 'guest';"
);

// Fix 3: Remove all setPanel calls
c = c.replace(/setPanel\([^)]*\);?/g, '');

// Fix 4: Add loading to useApp
c = c.replace(
  "const { properties, currentUser } = useApp();",
  "const { properties, currentUser, loading } = useApp();"
);

// Fix 5: Add loading guard before render
if (!c.includes('if (loading) return null;')) {
  c = c.replace(
    'const propList = properties.map',
    'if (loading) return null;\n  const propList = properties.map'
  );
}

// Fix 6: Remove host panel JSX block
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

fs.writeFileSync('src/app/pages/Map.tsx', c);
console.log('All done! setPanel remaining:', (c.match(/setPanel/g) || []).length);
