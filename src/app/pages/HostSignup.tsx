import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { COUNTRY_CODES, CountryCode, GoogleIcon, CountryPicker, OtpRow } from './AuthShared.tsx';
import { openCenteredPopup } from '../lib/oauthPopup';

type Tab = 'email' | 'phone';
const TEAL = '#3ECFB2';
const GOLD = '#E8B86D';
const CARD = 'rgba(255,255,255,0.05)';
const BORDER = '1px solid rgba(255,255,255,0.09)';
const inputCls = "w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none";
const inputStyle = { background: CARD, border: BORDER, color: 'white' };

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-baseline gap-2 mb-1.5">
      <label className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2 }}>{label}</label>
      {hint && <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{hint}</span>}
    </div>
    {children}
  </div>
);

const PERKS = ['💰 Earn Ksh 3K–50K/month', '📊 Real-time earnings dashboard', '📱 Guest tracking & comms', '🔒 Secure M-Pesa payments', '🌍 Reach international travelers'];

export default function HostSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState<Tab>('email');
  
  // Debug: Log authentication state
  console.log('HostSignup - Component mounted');
  console.log('Current step:', step);
  console.log('Current tab:', tab);

  // Personal
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Phone
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['','','','','','']);
  const [resend, setResend] = useState(0);

  // Business
  const [bizName, setBizName] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [agreed, setAgreed] = useState(false);

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
        const u = session.user;
        const m = u.user_metadata || {};
        const fullName = m.full_name || m.name || '';
        const avatarUrl = m.avatar_url || m.picture || null;

        // Make sure this account is marked as a HOST in auth metadata
        await supabase.auth.updateUser({
          data: {
            ...m,
            role: 'host',
          },
        });

        // Ensure we have a host profile row
        await supabase.from('profiles').upsert(
          {
            id: u.id,
            full_name: fullName,
            email: u.email,
            avatar_url: avatarUrl,
            role: 'host',
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );

        navigate('/host');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogle = async () => {
    console.log('🔍 Google OAuth - Starting...');
    console.log('🔍 Google OAuth - Provider: google');
    setGLoading(true); setError('');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth/callback?next=/host`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    console.log('🔍 Google OAuth - Response:', { data, error });
    if (error) {
      console.error('🔍 Google OAuth - Error:', error.message);
      setError(error.message); setGLoading(false); return;
    }
    const popup = data?.url ? openCenteredPopup(data.url, 'LALA Kenya — Google') : null;
    if (!popup) {
      setError('Popup blocked. Please allow popups and try again.');
      setGLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!name.trim()) { setError('Please enter your full name'); return false; }
    if (tab === 'email') {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return false; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return false; }
    } else {
      if (phone.replace(/\D/g, '').length < 6) { setError('Enter a valid phone number'); return false; }
    }
    return true;
  };

  const handleStep1 = () => { if (!validateStep1()) return; setError(''); setStep(2); };

  const handleEmailSignup = async () => {
    console.log('📧 Email Signup - Starting...');
    console.log('📧 Email Signup - Data:', { name: name.trim(), email: email.trim(), password, bizName: bizName.trim() });
    
    if (!bizName.trim()) { setError('Please enter your business or property name'); return; }
    if (!agreed) { setError('Please agree to the Host Terms to continue'); return; }
    setLoading(true); setError('');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim(), role: 'host', business_name: bizName.trim() } },
    });
    console.log('📧 Email Signup - Response:', { data, error });
    if (error) {
      console.error('📧 Email Signup - Error:', error.message);
      setError(error.message); setLoading(false); return;
    }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: name.trim(), email: email.trim(), role: 'host', business_name: bizName.trim() });
    }
    setLoading(false); setSuccess(true);
  };

  const fullPhone = `${country.code}${phone.replace(/^0+/, '').replace(/\D/g, '')}`;

  const handleSendOTP = async () => {
    if (!bizName.trim()) { setError('Please enter your business or property name'); return; }
    if (!agreed) { setError('Please agree to the Host Terms to continue'); return; }
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
      await supabase.from('profiles').upsert({ id: data.user.id, full_name: name.trim(), phone: fullPhone, role: 'host', business_name: bizName.trim() });
    }
    navigate('/host');
  };

  const setOtpDigit = (i: number, val: string) => { const n = [...otp]; n[i] = val; setOtp(n); };

  // ── SUCCESS ──
  if (success) return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#06060c' }}>
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col items-center justify-center px-8"
        style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <BackRefreshBar />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, delay: 0.1 }} className="text-[80px] mb-6">🏠</motion.div>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 12 }}>Host account created!</h2>
        <p className="text-[13px] text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>Verification link sent to</p>
        <div className="px-5 py-3 rounded-[14px] mb-8" style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.25)' }}>
          <p className="text-[15px] font-bold text-center" style={{ color: TEAL }}>{email}</p>
        </div>
        <p className="text-[13px] text-center mb-8" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
          Verify your email then start listing your properties and earning with LALA Kenya.
        </p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/login')}
          className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
          style={{ background: `linear-gradient(135deg, ${TEAL}, #2AA893)`, color: '#0D0F14' }}>
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
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(62,207,178,0.07) 0%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col flex-1 px-7 pt-12 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => step === 1 ? navigate('/signup') : setStep(1)}
            className="mb-4 text-left border-none bg-transparent cursor-pointer text-[14px] font-bold"
            style={{ color: GOLD }}>← {step === 1 ? 'Back' : 'Previous step'}</button>

          {/* Progress bar */}
          <div className="flex gap-2 mb-5">
            {[1, 2].map(s => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all duration-500"
                style={{ background: s <= step ? TEAL : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] mb-3"
              style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
              {step === 1 ? '🏠' : '🏢'}
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 900, color: 'white' }}>
              {step === 1 ? 'Host Account' : 'Business Details'}
            </h1>
            <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Step {step} of 2 — {step === 1 ? 'Personal details' : 'Required for payouts'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex flex-col gap-4">

                {/* Google */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleGoogle} disabled={gLoading}
                  className="w-full py-3.5 rounded-[16px] border-none cursor-pointer flex items-center justify-center gap-3"
                  style={{ background: 'white', color: '#111', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.5)', opacity: gLoading ? 0.8 : 1 }}>
                  {gLoading ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> : <GoogleIcon />}
                  {gLoading ? 'Opening Google...' : 'Sign up with Google'}
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or sign up with</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                </div>

                {/* Tab */}
                <div className="flex rounded-[14px] p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {(['email', 'phone'] as Tab[]).map(t => (
                    <button key={t} onClick={() => { setTab(t); setError(''); }}
                      className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer text-[13px] font-bold flex items-center justify-center gap-1.5"
                      style={{ background: tab === t ? TEAL : 'transparent', color: tab === t ? '#0D0F14' : 'rgba(255,255,255,0.4)' }}>
                      {t === 'email' ? '✉️ Email' : '📱 Phone'}
                    </button>
                  ))}
                </div>

                <Field label="FULL NAME">
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="James Kariuki" autoComplete="name"
                    className={inputCls} style={inputStyle} />
                </Field>

                {tab === 'email' && (
                  <>
                    <Field label="EMAIL ADDRESS">
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="james@example.com" autoComplete="email"
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
                    </Field>
                  </>
                )}

                {tab === 'phone' && (
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
                  </Field>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleStep1}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: `linear-gradient(135deg, ${TEAL}, #2AA893)`, color: '#0D0F14' }}>
                  Continue →
                </motion.button>
              </motion.div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">

                <Field label="BUSINESS / PROPERTY NAME">
                  <input type="text" value={bizName} onChange={e => setBizName(e.target.value)}
                    placeholder="Kariuki Heights Kilimani" autoComplete="organization"
                    className={inputCls} style={inputStyle} />
                </Field>

                <Field label="KRA PIN" hint="(Optional — needed for payouts)">
                  <input type="text" value={kraPin} onChange={e => setKraPin(e.target.value.toUpperCase())}
                    placeholder="A123456789B" maxLength={11}
                    className={inputCls} style={inputStyle} />
                </Field>

                {/* Perks */}
                <div className="rounded-[16px] p-4" style={{ background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.14)' }}>
                  <div className="text-[10px] font-black mb-2.5" style={{ color: TEAL, letterSpacing: 1.2 }}>✨ HOST BENEFITS</div>
                  {PERKS.map((p, i) => (
                    <div key={i} className="text-[12px] mb-1.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{p}</div>
                  ))}
                </div>

                <div className="rounded-[14px] px-4 py-3" style={{ background: 'rgba(232,184,109,0.06)', border: '1px solid rgba(232,184,109,0.14)' }}>
                  <div className="text-[11px] font-bold" style={{ color: GOLD }}>🔐 LALA Commission: 10%</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>We only earn when you earn. No upfront fees.</div>
                </div>

                {/* Terms */}
                <button onClick={() => setAgreed(v => !v)}
                  className="flex items-start gap-3 border-none bg-transparent cursor-pointer text-left p-0">
                  <div className="w-5 h-5 rounded-[6px] flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: agreed ? TEAL : 'rgba(255,255,255,0.07)', border: agreed ? 'none' : '1.5px solid rgba(255,255,255,0.15)' }}>
                    {agreed && <span className="text-[11px] font-black" style={{ color: '#0D0F14' }}>✓</span>}
                  </div>
                  <span className="text-[12px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    I agree to LALA Kenya's{' '}
                    <span style={{ color: GOLD }}>Host Terms</span>,{' '}
                    <span style={{ color: GOLD }}>Privacy Policy</span>, and the 10% commission structure
                  </span>
                </button>

                {/* Phone OTP flow */}
                {tab === 'phone' && phoneStep === 'otp' && (
                  <div className="flex flex-col gap-3">
                    <div className="text-center">
                      <div className="text-[13px] font-bold mb-1" style={{ color: 'white' }}>Enter your SMS code</div>
                      <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{country.flag} {country.code} {phone}</div>
                    </div>
                    <OtpRow otp={otp} onChange={setOtpDigit} idPrefix="hsig-otp" accentColor={TEAL} />
                    <div className="text-center">
                      {resend > 0 ? <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Resend in {resend}s</span>
                        : <button onClick={() => setPhoneStep('input')} className="text-[12px] border-none bg-transparent cursor-pointer" style={{ color: GOLD, fontWeight: 700 }}>Resend code</button>}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={tab === 'email' ? handleEmailSignup : (phoneStep === 'input' ? handleSendOTP : handleVerifyOTP)}
                  disabled={loading || (tab === 'phone' && phoneStep === 'otp' && otp.join('').length < 6)}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${TEAL}, #2AA893)`, color: loading ? 'rgba(255,255,255,0.4)' : '#0D0F14' }}>
                  {loading ? 'Creating host account...' :
                   tab === 'email' ? '🏠 Create Host Account →' :
                   phoneStep === 'input' ? 'Send Verification SMS 📲' :
                   otp.join('').length < 6 ? `${otp.filter(Boolean).length}/6 digits` : 'Verify & Create Account →'}
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

        <CountryPicker visible={showPicker} selected={country} onSelect={setCountry} onClose={() => setShowPicker(false)} accentColor={TEAL} />
      </motion.div>
    </div>
  );
}