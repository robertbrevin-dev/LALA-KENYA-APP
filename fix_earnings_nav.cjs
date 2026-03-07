const fs = require('fs');

// 1. Fix BottomNav - host gets teal active color
let nav = fs.readFileSync('src/app/components/BottomNav.tsx', 'utf8');
nav = nav.replace("const GOLD = '#E8B86D';", "const GOLD = '#E8B86D';\nconst TEAL = '#3ECFB2';");
nav = nav.replace(
  "const items = role === 'host' ? hostNavItems : guestNavItems;",
  "const items = role === 'host' ? hostNavItems : guestNavItems;\n  const activeColor = role === 'host' ? TEAL : GOLD;\n  const activeBg = role === 'host' ? 'rgba(62,207,178,0.12)' : 'rgba(232,184,109,0.12)';"
);
nav = nav.replace("style={{ color: isActive ? GOLD : MUTED }}>", "style={{ color: isActive ? activeColor : MUTED }}>");
nav = nav.replace("background: isActive ? 'rgba(232,184,109,0.12)' : 'transparent'", "background: isActive ? activeBg : 'transparent'");
nav = nav.replace(
  "const mkItem = (icon: (c: string) => JSX.Element, label: string, path: string): NavItem => ({\n  icon: icon(MUTED), activeIcon: icon(GOLD), label, path,\n});",
  "const mkItem = (icon: (c: string) => JSX.Element, label: string, path: string, active = GOLD): NavItem => ({\n  icon: icon(MUTED), activeIcon: icon(active), label, path,\n});"
);
nav = nav.replace(
  "const hostNavItems: NavItem[] = [\n  mkItem(DashIcon, 'Dashboard', '/host'),\n  mkItem(ListIcon, 'Listings', '/host/listings'),\n  mkItem(BookIcon, 'Bookings', '/host/bookings'),\n  mkItem(MapIcon, 'Map', '/host/map'),\n  mkItem(EarnIcon, 'Earnings', '/host/earnings'),\n];",
  "const hostNavItems: NavItem[] = [\n  mkItem(DashIcon, 'Dashboard', '/host', TEAL),\n  mkItem(ListIcon, 'Listings', '/host/listings', TEAL),\n  mkItem(BookIcon, 'Bookings', '/host/bookings', TEAL),\n  mkItem(MapIcon, 'Map', '/host/map', TEAL),\n  mkItem(EarnIcon, 'Earnings', '/host/earnings', TEAL),\n];"
);
fs.writeFileSync('src/app/components/BottomNav.tsx', nav);
console.log('BottomNav done');

// 2. Fix HostEarnings
let e = fs.readFileSync('src/app/pages/HostEarnings.tsx', 'utf8');
e = e.replace("background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)'", "background: 'linear-gradient(135deg, #0a2420, #061412)', border: '1px solid rgba(62,207,178,0.25)'");
e = e.replace("color: 'rgba(13,15,20,0.6)', fontWeight: 500 }}>This Month (Net)", "color: 'rgba(62,207,178,0.6)', fontWeight: 700, letterSpacing: 1 }}>THIS MONTH (NET)");
e = e.replace("color: 'var(--lala-night)' }}>", "color: 'white' }}>");
e = e.replace("color: 'rgba(13,15,20,0.55)' }>", "color: 'rgba(255,255,255,0.5)' }>");
e = e.replace(/color: 'var\(--lala-white\)'/g, "color: 'white'");
e = e.replace(/color: 'var\(--lala-soft\)'/g, "color: 'rgba(255,255,255,0.6)'");
e = e.replace(/color: 'var\(--lala-muted\)'/g, "color: 'rgba(255,255,255,0.35)'");
e = e.replace(/color: 'var\(--lala-teal\)'/g, "color: '#3ECFB2'");
e = e.replace(/background: 'var\(--lala-card\)', border: '1px solid var\(--lala-border\)'/g, "background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(62,207,178,0.08)'");
e = e.replace("background: i === 5 ? 'var(--lala-gold)' : 'rgba(232,184,109,0.25)'", "background: i === 5 ? '#3ECFB2' : 'rgba(62,207,178,0.15)'");
e = e.replace("color: i === 5 ? 'var(--lala-gold)' : 'var(--lala-muted)'", "color: i === 5 ? '#3ECFB2' : 'rgba(255,255,255,0.3)'");
fs.writeFileSync('src/app/pages/HostEarnings.tsx', e);
console.log('HostEarnings done');
