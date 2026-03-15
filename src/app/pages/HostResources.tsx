import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext.tsx';

const TEAL = '#3ECFB2';

const resources = [
  { t: 'How to List a Property', d: 'Step-by-step guide to creating your first listing', content: `1. Go to your Host Dashboard and tap "Add New Listing".\n2. Fill in your property title, description, category and nightly price in Ksh.\n3. Add at least 4 high-quality photos — more photos get 3x more bookings.\n4. Set your exact location on the map so guests can find you easily.\n5. Toggle "Visible on Map" to make your property discoverable.\n6. Tap Publish — your listing goes live instantly on LALA Kenya.` },
  { t: 'Managing Bookings', d: 'Accept, decline and manage guest reservations', content: `When a guest books your property:\n\n- You receive an instant notification.\n- Go to Host Dashboard then All Bookings to view the request.\n- Accept or Decline within 24 hours.\n- Once accepted, the guest receives check-in instructions automatically.\n- You can message the guest directly through LALA chat.\n- Mark the stay as completed after check-out to trigger your payout.` },
  { t: 'M-Pesa Payouts', d: 'How and when you receive your earnings', content: `M-Pesa Daraja integration is coming soon.\n\nWhen live:\n- Payouts will be sent to your registered M-Pesa number within 24 hours of guest check-in.\n- LALA Kenya deducts a 10% platform commission before payout.\n- Track all earnings in Host Dashboard then Earnings.\n- Minimum payout threshold: Ksh 500.\n\nFor payout queries contact lalakenya@gmail.com` },
  { t: 'Getting Great Reviews', d: 'Tips to improve your rating and visibility', content: `Top-rated hosts on LALA Kenya follow these practices:\n\n- Respond to booking requests within 2 hours.\n- Ensure the property is clean and exactly as shown in photos.\n- Provide WiFi password, house rules and nearby spot recommendations.\n- Check in on guests after their first night with a simple message.\n- Properties with 4.9 plus ratings appear first in search results.\n- Kindly ask satisfied guests to leave a review after checkout.` },
  { t: 'Safety and Security', d: 'Protecting yourself and your property', content: `Your safety is LALA Kenya's priority:\n\n- All guests verify identity during signup — ID and phone number required.\n- Never share home access with unverified guests.\n- Install a smart lock or key lockbox for contactless check-in.\n- Keep a copy of guest IDs for stays longer than 3 nights.\n- Report suspicious activity to lalakenya@gmail.com or WhatsApp +254 114 040 146 immediately.\n- LALA Kenya has a zero-tolerance policy for property damage.` },
  { t: 'Contact Support', d: 'Reach the LALA Kenya host support team', content: 'CONTACT' },
];

const SocialIcon = ({ href, bg, children }: { href: string; bg: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer"
    style={{ width: 46, height: 46, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
    {children}
  </a>
);

export default function HostResources() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: '#03020a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 390, height: 844, borderRadius: 44, overflow: 'hidden', background: 'linear-gradient(170deg, #061412 0%, #080608 100%)', border: '1px solid rgba(62,207,178,0.1)', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '56px 24px 20px', borderBottom: '1px solid rgba(62,207,178,0.1)', flexShrink: 0 }}>
          <button onClick={() => navigate('/host/profile')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>&#8592; Back</button>
          <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white' }}>Host Resources</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Guides, tips and support for hosts</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'none' }}>
          {resources.map((r, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: open === i ? '14px 14px 0 0' : 14, background: open === i ? 'rgba(62,207,178,0.1)' : 'rgba(62,207,178,0.05)', border: '1px solid ' + (open === i ? 'rgba(62,207,178,0.3)' : 'rgba(62,207,178,0.1)'), borderBottom: open === i ? 'none' : undefined, cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(62,207,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TEAL, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{r.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.d}</div>
                </div>
                <span style={{ color: TEAL, fontSize: 16, display: 'inline-block', transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </motion.button>

              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ background: 'rgba(62,207,178,0.03)', border: '1px solid rgba(62,207,178,0.15)', borderTop: 'none', borderRadius: '0 0 14px 14px', overflow: 'hidden' }}>
                    {r.content === 'CONTACT' ? (
                      <div style={{ padding: '16px 16px 20px' }}>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14, lineHeight: 1.7 }}>Host support available 24/7. Reach us on any platform below.</div>
                        <a href="mailto:lalakenya@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.15)', textDecoration: 'none', marginBottom: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(62,207,178,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>
                          </div>
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Email Support</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>lalakenya@gmail.com</div></div>
                        </a>
                        <a href="https://wa.me/254114040146" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', textDecoration: 'none', marginBottom: 18 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </div>
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>WhatsApp Us</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>+254 114 040 146</div></div>
                        </a>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 12 }}>FOLLOW LALA KENYA</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <SocialIcon href="https://instagram.com/lalakenya" bg="linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          </SocialIcon>
                          <SocialIcon href="https://tiktok.com/@lalakenya" bg="rgba(255,255,255,0.06)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                          </SocialIcon>
                          <SocialIcon href="https://x.com/lalakenya" bg="rgba(255,255,255,0.06)">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </SocialIcon>
                          <SocialIcon href="https://facebook.com/lalakenya" bg="#1877F2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </SocialIcon>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '14px 18px 18px' }}>
                        {r.content.split('\n').map((line, j) => (
                          <div key={j} style={{ fontSize: 13, color: line === '' ? undefined : 'rgba(255,255,255,0.75)', marginBottom: line === '' ? 6 : 5, lineHeight: 1.75 }}>{line}</div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
