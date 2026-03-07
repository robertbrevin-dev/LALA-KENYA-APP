const fs = require('fs');
const c = fs.readFileSync('src/app/pages/Trips.tsx', 'utf8');
const updated = c
  .replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(true);\n  const [filter, setFilter] = useState('upcoming');")
  .replace("className=\"px-6 pt-14 pb-5\">", "style={{ padding: '56px 24px 20px', background: 'linear-gradient(180deg, #100c08 0%, #0a0808 100%)', borderBottom: '1px solid rgba(232,184,109,0.08)' }}>")
  .replace("color: 'var(--lala-white)'", "color: 'white'")
  .replace(/color: 'var\(--lala-soft\)'/g, "color: 'rgba(255,255,255,0.5)'")
  .replace(/color: 'var\(--lala-muted\)'/g, "color: 'rgba(255,255,255,0.35)'")
  .replace(/color: 'var\(--lala-gold\)'/g, "color: '#E8B86D'")
  .replace(/color: 'var\(--lala-teal\)'/g, "color: '#3ECFB2'")
  .replace(/background: 'var\(--lala-card\)', border: '1px solid var\(--lala-border\)'/g, "background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(232,184,109,0.1)'")
  .replace("borderTop: '1px solid var(--lala-border)'", "borderTop: '1px solid rgba(255,255,255,0.06)'")
  .replace("background: 'var(--lala-card)', border: '1px solid var(--lala-border)', color: 'var(--lala-white)'", "background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.2)', color: '#E8B86D'")
  .replace("<div className=\"flex-1 overflow-y-auto\" style={{ scrollbarWidth: 'none' }}>", "<div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', background: '#0a0808' }}>");
fs.writeFileSync('src/app/pages/Trips.tsx', updated);
console.log('done');
