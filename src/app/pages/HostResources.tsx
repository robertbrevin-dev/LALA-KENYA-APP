import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
const TEAL = '#3ECFB2';
const resources = [
  { t: 'How to List a Property', d: 'Step-by-step guide to creating your first listing' },
  { t: 'Managing Bookings', d: 'Accept, decline and manage guest reservations' },
  { t: 'M-Pesa Payouts', d: 'How and when you receive your earnings' },
  { t: 'Getting Great Reviews', d: 'Tips to improve your rating and visibility' },
  { t: 'Safety and Security', d: 'Protecting yourself and your property' },
  { t: 'Contact Support', d: 'Reach the LALA Kenya host support team' },
];
export default function HostResources() {
  const navigate = useNavigate();
  return (
    <div style={{ background: '#03020a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 390, height: 844, borderRadius: 44, overflow: 'hidden', background: 'linear-gradient(170deg, #061412 0%, #080608 100%)', border: '1px solid rgba(62,207,178,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(62,207,178,0.1)' }}>
          <button onClick={() => navigate('/host/profile')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>&#8592; Back</button>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>Host Resources</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Guides, tips and support for hosts</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'none' }}>
          {resources.map((r, i) => (
            <motion.button key={i} whileTap={{ scale: 0.98 }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, marginBottom: 12, background: 'rgba(62,207,178,0.05)', border: '1px solid rgba(62,207,178,0.1)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(62,207,178,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{r.t.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{r.t}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.d}</div>
              </div>
              <span style={{ color: TEAL }}>›</span>
            </motion.button>
          ))}
          <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.15)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, marginBottom: 6 }}>Need help?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>Host support 24/7. Email hosts@lala.co.ke or WhatsApp +254 700 000 000</div>
          </div>
        </div>
      </div>
    </div>
  );
}
