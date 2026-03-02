import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { COUNTRY_CODES, CountryCode, GoogleIcon, CountryPicker, OtpRow } from './AuthShared.tsx';
import { openCenteredPopup } from '../lib/oauthPopup';

type Tab = 'email' | 'phone';
const GOLD = '#E8B86D';
const CARD = 'rgba(255,255,255,0.05)';
const BORDER = '1px solid rgba(255,255,255,0.09)';
const inputCls = "w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none";
const inputStyle = { background: CARD, border: BORDER, color: 'white' };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-black block mb-1.5"
      style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2 }}>{label}</label>
    {children}
  </div>
);

export default function GuestSignup() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('email');

  // Email fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Phone fields
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [phoneName, setPhoneName] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['','','','','','']);
  const [resend, setResend] = useState(0);

  // Shared
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (resend <= 0) return;
    const t = setTimeout(() => setResend(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resend]);

  useEffect(() => {
    if (otp.join('').length === 6 && phoneStep === 'otp') handleVerifyOTP();
  }, [otp]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user; const m = u.user_metadata;
        await supabase.from('profiles').upsert({
          id: u.id, full_name: m?.full_name || m?.name || '',
          email: u.email, avatar_url: m?.avatar_url || m?.picture || null, role: 'guest',
        }, { onConflict: 'id', ignoreDuplicates: true });
        navigate('/home');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth/callback?next=/home`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    if (error) { setError(error.message); setGLoading(false); return; }
    const popup = data?.url ? openCenteredPopup(data.url, 'LALA Kenya — Google') : null;
    if (!popup) {
      setError('Popup blocked. Please allow popups and try again.');
      setGLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!name.trim()) { setError('Please enter your full name'); return; }
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!agreed) { setError('Please agree to the Terms & Privacy Policy to continue'); return; }
    setLoading(true); setError('');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: name.trim(), role: 'guest' } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: name.trim(), email: email.trim(), role: 'guest' });
    }
    setLoading(false); setSuccess(true);
  };

  const fullPhone = `${country.code}${phone.replace(/^0+/, '').replace(/\D/g, '')}`;

  const handleSendOTP = async () => {
    if (!phoneName.trim()) { setError('Please enter your full name'); return; }
    if (phone.replace(/\D/g, '').length < 6) { setError('Enter a valid phone number'); return; }
    if (!agreed) { setError('Please agree to the Terms & Privacy Policy to continue'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false); setPhoneStep('otp'); setResend(60); setOtp(['','','','','','']);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true); setError('');
    const { data, error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: 'sms' });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: phoneName.trim(), phone: fullPhone, role: 'guest' });
    }
    navigate('/home');
  };

  const setOtpDigit = (i: number, val: string) => { const n = [...otp]; n[i] = val; setOtp(n); };

  // ── SUCCESS SCREEN ──
  if (success) return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#06060c' }}>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col items-center justify-center px-8"
        style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <BackRefreshBar />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
          className="text-[80px] mb-6">✅</motion.div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 12 }}>
          Almost there!
        </h2>
        <p className="text-[14px] text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>
          We sent a verification link to
        </p>
        <div className="px-5 py-3 rounded-[14px] mb-8"
          style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.25)' }}>
          <p className="text-[15px] font-bold text-center" style={{ color: GOLD }}>{email}</p>
        </div>
        <p className="text-[13px] text-center mb-8" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
          Click the link in your email to activate your account. Check your spam folder if you don't see it.
        </p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
          className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
          style={{ background: `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: '#0D0F14' }}>
          Go to Login →
        </motion.button>
      </motion.div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#06060c' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <BackRefreshBar />
        <div className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,184,109,0.07) 0%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col flex-1 px-7 pt-12 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => navigate('/signup')}
            className="mb-5 text-left border-none bg-transparent cursor-pointer text-[14px] font-bold"
            style={{ color: GOLD }}>← Back</button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] mb-3"
              style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.2)' }}>🏨</div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 900, color: 'white' }}>Guest Account</h1>
            <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Book verified short stays across Nairobi
            </p>
          </motion.div>

          {/* Google */}
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            onClick={handleGoogle} disabled={gLoading} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-[16px] border-none cursor-pointer mb-4 flex items-center justify-center gap-3"
            style={{ background: 'white', color: '#111', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.5)', opacity: gLoading ? 0.8 : 1 }}>
            {gLoading ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> : <GoogleIcon />}
            {gLoading ? 'Opening Google...' : 'Sign up with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or sign up with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-[14px] p-1 mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['email', 'phone'] as Tab[]).map(t => (
              <button key={t}
                onClick={() => { setTab(t); setError(''); setPhoneStep('input'); setOtp(['','','','','','']); }}
                className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer text-[13px] font-bold flex items-center justify-center gap-1.5"
                style={{ background: tab === t ? GOLD : 'transparent', color: tab === t ? '#0D0F14' : 'rgba(255,255,255,0.4)' }}>
                {t === 'email' ? '✉️ Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══ EMAIL ══ */}
            {tab === 'email' && (
              <motion.div key="email"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="flex flex-col gap-4">
                <Field label="FULL NAME">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jane Odhiambo" autoComplete="name"
                    className={inputCls} style={inputStyle} />
                </Field>
                <Field label="EMAIL ADDRESS">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jane@example.com" autoComplete="email"
                    className={inputCls} style={inputStyle} />
                </Field>
                <Field label="PASSWORD">
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters" autoComplete="new-password"
                      className={inputCls} style={{ ...inputStyle, paddingRight: 48 }} />
                    <button onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[18px]"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>{showPass ? '🙈' : '👁️'}</button>
                  </div>
                  {/* Password strength */}
                  {password.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4].map(n => (
                        <div key={n} className="flex-1 h-1 rounded-full"
                          style={{ background: password.length >= n*3 ? (password.length >= 10 ? '#3ECFB2' : GOLD) : 'rgba(255,255,255,0.1)' }} />
                      ))}
                      <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {password.length < 6 ? 'Weak' : password.length < 10 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                </Field>

                {/* Terms checkbox */}
                <button onClick={() => setAgreed(v => !v)}
                  className="flex items-start gap-3 border-none bg-transparent cursor-pointer text-left p-0">
                  <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: agreed ? GOLD : 'rgba(255,255,255,0.07)', border: agreed ? 'none' : '1.5px solid rgba(255,255,255,0.15)' }}>
                    {agreed && <span className="text-[11px] font-black" style={{ color: '#0D0F14' }}>✓</span>}
                  </div>
                  <span className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    I agree to LALA Kenya's{' '}
                    <span style={{ color: GOLD }}>Terms of Service</span> and{' '}
                    <span style={{ color: GOLD }}>Privacy Policy</span>
                  </span>
                </button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleEmailSignup} disabled={loading}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: loading ? 'rgba(255,255,255,0.4)' : '#0D0F14' }}>
                  {loading ? 'Creating account...' : 'Create Guest Account →'}
                </motion.button>
              </motion.div>
            )}

            {/* ══ PHONE — INPUT ══ */}
            {tab === 'phone' && phoneStep === 'input' && (
              <motion.div key="ph-in"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-4">
                <Field label="FULL NAME">
                  <input type="text" value={phoneName} onChange={e => setPhoneName(e.target.value)}
                    placeholder="Jane Odhiambo" autoComplete="name"
                    className={inputCls} style={inputStyle} />
                </Field>
                <Field label="PHONE NUMBER">
                  <div className="flex gap-2">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowPicker(true)}
                      className="flex items-center gap-2 px-3 py-3.5 rounded-[14px] border-none cursor-pointer flex-shrink-0"
                      style={{ background: CARD, border: BORDER, minWidth: 96 }}>
                      <span className="text-[22px] leading-none">{country.flag}</span>
                      <div className="text-left">
                        <div className="text-[12px] font-bold" style={{ color: 'white' }}>{country.code}</div>
                        <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{country.abbr}</div>
                      </div>
                      <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>▾</span>
                    </motion.button>
                    <input type="tel" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                      placeholder="712 345 678" autoComplete="tel-national"
                      className={`flex-1 ${inputCls}`} style={inputStyle} />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {country.flag} SMS code will be sent to {country.code} {phone || '...'}
                  </p>
                </Field>

                {/* Terms */}
                <button onClick={() => setAgreed(v => !v)}
                  className="flex items-start gap-3 border-none bg-transparent cursor-pointer text-left p-0">
                  <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: agreed ? GOLD : 'rgba(255,255,255,0.07)', border: agreed ? 'none' : '1.5px solid rgba(255,255,255,0.15)' }}>
                    {agreed && <span className="text-[11px] font-black" style={{ color: '#0D0F14' }}>✓</span>}
                  </div>
                  <span className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    I agree to LALA Kenya's{' '}
                    <span style={{ color: GOLD }}>Terms of Service</span> and{' '}
                    <span style={{ color: GOLD }}>Privacy Policy</span>
                  </span>
                </button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSendOTP} disabled={loading}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: loading ? 'rgba(255,255,255,0.4)' : '#0D0F14' }}>
                  {loading ? 'Sending SMS...' : 'Send Verification Code 📲'}
                </motion.button>
              </motion.div>
            )}

            {/* ══ PHONE — OTP ══ */}
            {tab === 'phone' && phoneStep === 'otp' && (
              <motion.div key="ph-otp"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-5">
                <div className="text-center">
                  <div className="text-[48px] mb-3">📲</div>
                  <div className="text-[17px] font-bold" style={{ color: 'white' }}>Check your messages</div>
                  <div className="text-[13px] mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Code sent to <span style={{ color: GOLD, fontWeight: 700 }}>{country.flag} {country.code} {phone}</span>
                  </div>
                </div>
                <OtpRow otp={otp} onChange={setOtpDigit} idPrefix="gsig-otp" accentColor={GOLD} />
                <div className="text-center">
                  {resend > 0
                    ? <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Resend in {resend}s</span>
                    : <div className="flex items-center justify-center gap-3">
                        <button onClick={() => { setPhoneStep('input'); setOtp(['','','','','','']); setError(''); }}
                          className="text-[13px] border-none bg-transparent cursor-pointer" style={{ color: GOLD, fontWeight: 700 }}>← Change number</button>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                        <button onClick={handleSendOTP} className="text-[13px] border-none bg-transparent cursor-pointer" style={{ color: GOLD, fontWeight: 700 }}>Resend</button>
                      </div>}
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleVerifyOTP}
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: otp.join('').length < 6 ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: otp.join('').length < 6 ? 'rgba(255,255,255,0.25)' : '#0D0F14' }}>
                  {loading ? 'Verifying...' : otp.join('').length === 6 ? 'Verifying...' : `${otp.filter(Boolean).length}/6 digits entered`}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-5">
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Already have an account? </span>
            <button onClick={() => navigate('/login')} className="text-[13px] border-none bg-transparent cursor-pointer"
              style={{ color: GOLD, fontWeight: 700 }}>Sign in</button>
          </div>
        </div>

        <CountryPicker visible={showPicker} selected={country} onSelect={setCountry} onClose={() => setShowPicker(false)} accentColor={GOLD} />
      </motion.div>
    </div>
  );
}