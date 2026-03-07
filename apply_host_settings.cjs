const fs = require('fs');

// Fix routes.tsx
let routes = fs.readFileSync('src/app/routes.tsx', 'utf8');
if (!routes.includes('HostAccountSettings')) {
  routes = routes.replace(
    "import HostResources from './pages/HostResources';",
    "import HostResources from './pages/HostResources';\nimport HostAccountSettings from './pages/HostAccountSettings';"
  );
  routes = routes.replace(
    "{ path: 'host/settings/account', Component: PersonalInformation },",
    "{ path: 'host/settings/account', Component: HostAccountSettings },"
  );
  routes = routes.replace(
    "{ path: 'host/settings/resources', Component: HelpCenter },",
    "{ path: 'host/settings/resources', Component: HostResources },"
  );
  fs.writeFileSync('src/app/routes.tsx', routes);
  console.log('routes fixed');
} else {
  console.log('routes already updated');
}

// Create HostAccountSettings.tsx
const accountSettings = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../context/AppContext';

const TEAL = '#3ECFB2';

export default function HostAccountSettings() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!currentUser?.id) return;
    setLoading(true); setError(''); setSuccess(false);
    const { error } = await supabase.from('profiles').update({ full_name: name, phone }).eq('id', currentUser.id);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(170deg, #061412 0%, #080608 100%)', border: '1px solid rgba(62,207,178,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <div className="px-6 pt-14 pb-5" style={{ borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
          <button onClick={() => navigate('/host/profile')}
            className="flex items-center gap-2 border-none bg-transparent cursor-pointer mb-4"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            &#8592; Back
          </button>
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3"
            style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>Account Settings</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Update your host account information</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
          <div className="mb-5">
            <label className="block text-[11px] font-bold mb-2" style={{ color: 'rgba(62,207,178,0.6)', letterSpacing: 1 }}>FULL NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
              className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)', color: 'white' }} />
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-bold mb-2" style={{ color: 'rgba(62,207,178,0.6)', letterSpacing: 1 }}>EMAIL ADDRESS</label>
            <input type="email" value={currentUser?.email || ''} disabled placeholder="your@email.com"
              className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }} />
            <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Email cannot be changed here</p>
          </div>
          <div className="mb-5">
            <label className="block text-[11px] font-bold mb-2" style={{ color: 'rgba(62,207,178,0.6)', letterSpacing: 1 }}>PHONE NUMBER</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX"
              className="w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(62,207,178,0.15)', color: 'white' }} />
          </div>
          {error && <div className="px-4 py-3 rounded-[12px] text-[13px] mb-4" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>{error}</div>}
          {success && <div className="px-4 py-3 rounded-[12px] text-[13px] mb-4" style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)', color: TEAL }}>Account updated successfully!</div>}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={loading}
            className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px] mt-2"
            style={{ background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #3ECFB2, #2AA893)', color: loading ? 'rgba(255,255,255,0.3)' : '#061412' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[13px] font-bold mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Security</h3>
            <button onClick={() => navigate('/forgot-password/host')}
              className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
              Change Password
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
`;
fs.writeFileSync('src/app/pages/HostAccountSettings.tsx', accountSettings);
console.log('HostAccountSettings.tsx created');

// Create HostResources.tsx
const hostResources = `import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const TEAL = '#3ECFB2';

const resources = [
  { icon: '🏠', title: 'How to List a Property', desc: 'Step-by-step guide to creating your first listing', path: null },
  { icon: '📅', title: 'Managing Bookings', desc: 'Accept, decline and manage guest reservations', path: null },
  { icon: '💰', title: 'M-Pesa Payouts', desc: 'How and when you receive your earnings', path: null },
  { icon: '⭐', title: 'Getting Great Reviews', desc: 'Tips to improve your rating and visibility', path: null },
  { icon: '🔒', title: 'Safety & Security', desc: 'Protecting yourself and your property', path: null },
  { icon: '📞', title: 'Contact Support', desc: 'Reach the LALA Kenya host support team', path: null },
];

export default function HostResources() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(170deg, #061412 0%, #080608 100%)', border: '1px solid rgba(62,207,178,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <div className="px-6 pt-14 pb-5" style={{ borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
          <button onClick={() => navigate('/host/profile')}
            className="flex items-center gap-2 border-none bg-transparent cursor-pointer mb-4"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            &#8592; Back
          </button>
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-3"
            style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>Host Resources</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Guides, tips and support for hosts</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: 'none' }}>
          {resources.map((r, i) => (
            <motion.button key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-4 p-4 rounded-[16px] mb-3 border-none cursor-pointer text-left"
              style={{ background: 'rgba(62,207,178,0.05)', border: '1px solid rgba(62,207,178,0.1)' }}>
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[22px] flex-shrink-0"
                style={{ background: 'rgba(62,207,178,0.08)' }}>{r.icon}</div>
              <div className="flex-1">
                <div className="text-[14px] font-bold" style={{ color: 'white' }}>{r.title}</div>
                <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.desc}</div>
              </div>
              <span style={{ color: TEAL, fontSize: 16 }}>&#8250;</span>
            </motion.button>
          ))}
          <div className="mt-4 p-4 rounded-[16px]" style={{ background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.15)' }}>
            <div className="text-[13px] font-bold mb-1" style={{ color: TEAL }}>Need help?</div>
            <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Our host support team is available 24/7. Email us at hosts@lala.co.ke or WhatsApp +254 700 000 000
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
`;
fs.writeFileSync('src/app/pages/HostResources.tsx', hostResources);
console.log('HostResources.tsx created');
