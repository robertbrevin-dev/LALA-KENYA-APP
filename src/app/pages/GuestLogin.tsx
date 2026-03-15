import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { useApp } from '../context/AppContext';
import { COUNTRY_CODES, CountryCode, GoogleIcon, CountryPicker, OtpRow } from './AuthShared';
import { openCenteredPopup } from '../lib/oauthPopup';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext.tsx';

type Tab = 'email' | 'phone';
const GOLD = '#E8B86D';
const CARD = 'rgba(255,255,255,0.05)';
const BORDER = '1px solid rgba(255,255,255,0.09)';
const inputCls = 'w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none';
const inputStyle = { background: CARD, border: BORDER, color: 'white' };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-black block mb-1.5"
      style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2 }}>{label}</label>
    {children}
  </div>
);

export default function GuestLogin() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentUser, loading: appLoading, refreshUser } = useApp();
  useEffect(() => {
    if (!appLoading && currentUser) navigate('/home');
  }, [appLoading, currentUser]);
  const [tab, setTab] = useState<Tab>('email');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resend, setResend] = useState(0);

  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as guest, redirect to home
  useEffect(() => {
    if (currentUser && currentUser.role !== 'host') {
      navigate('/home');
    }
    // If logged in as host, do NOT redirect here — they must switch manually
  }, [currentUser]);

  useEffect(() => {
    if (resend <= 0) return;
    const timer = setTimeout(() => setResend(v => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resend]);

  useEffect(() => {
    if (otp.join('').length === 6 && phoneStep === 'otp') handleVerifyOTP();
  }, [otp]);

  // Google callback — only accepts guest role
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const m = u.user_metadata;
        await supabase.from('profiles').upsert({
          id: u.id,
          full_name: m?.full_name || m?.name || '',
          email: u.email,
          avatar_url: m?.avatar_url || m?.picture || null,
          role: 'guest',
        }, { onConflict: 'id', ignoreDuplicates: true });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const reset = () => { setError(''); setLoading(false); };

  const handleEmailLogin = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    console.log('signIn result:', JSON.stringify({error: authError?.message, user: data?.user?.email}));
    if (authError) { setError(authError.message); setLoading(false); return; }

    await refreshUser('guest');
    navigate('/home');
  };

  const fullPhone = `${country.code}${phone.replace(/^0+/, '').replace(/\D/g, '')}`;

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 6) { setError('Enter a valid phone number'); return; }
    setLoading(true); setError('');
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (otpError) { setError(otpError.message); setLoading(false); return; }
    setLoading(false); setPhoneStep('otp'); setResend(60); setOtp(['', '', '', '', '', '']);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    const { data, error: verifyError } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: 'sms' });
    if (verifyError) { setError(verifyError.message); setLoading(false); return; }

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role === 'host') {
        await supabase.auth.signOut();
        setError('This is a host account. Please use the host login page.');
        setLoading(false);
        return;
      }
    }
    navigate('/home');
  };

  const handleGoogle = async () => {
    setGLoading(true); setError('');
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth/callback?next=/home`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    if (oauthError) { setError(oauthError.message); setGLoading(false); return; }
    const popup = data?.url ? openCenteredPopup(data.url, 'LALA Kenya — Google') : null;
    if (!popup) { setError('Popup blocked. Please allow popups and try again.'); setGLoading(false); }
  };

  const setOtpDigit = (i: number, val: string) => {
    const next = [...otp]; next[i] = val; setOtp(next);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#06060c' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}
      >
        <BackRefreshBar />

        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,184,109,0.08) 0%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col flex-1 px-7 pt-14 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          <div className="flex justify-end mb-2">
            <LanguageSwitcher compact />
          </div>

          {/* Back */}
          <button onClick={() => navigate('/')}
            className="mb-4 self-start border-none bg-transparent cursor-pointer text-[13px] font-bold flex items-center gap-1"
            style={{ color: GOLD }}>
            ← Back
          </button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[24px] mb-3"
              style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.2)' }}>
              🏨
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 900, color: 'white' }}>
              Guest Login
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Sign in to your guest account
            </p>
          </motion.div>

          {/* Google */}
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            onClick={handleGoogle} disabled={gLoading} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-[16px] border-none cursor-pointer mb-2 flex items-center justify-center gap-3"
            style={{ background: 'white', color: '#111', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.5)', opacity: gLoading ? 0.8 : 1 }}>
            {gLoading ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> : <GoogleIcon />}
            {gLoading ? 'Opening Google...' : 'Continue with Google'}
          </motion.button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or continue with</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Tab */}
          <div className="flex rounded-[14px] p-1 mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['email', 'phone'] as Tab[]).map(t => (
              <button key={t}
                onClick={() => { setTab(t); reset(); setPhoneStep('input'); setOtp(['', '', '', '', '', '']); }}
                className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: tab === t ? GOLD : 'transparent', color: tab === t ? '#0D0F14' : 'rgba(255,255,255,0.4)' }}>
                {t === 'email' ? '✉️ Email' : '📱 Phone'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* EMAIL */}
            {tab === 'email' && (
              <motion.div key="email"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="flex flex-col gap-4">
                <Field label="EMAIL ADDRESS">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className={inputCls} style={inputStyle} />
                </Field>
                <Field label="PASSWORD">
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Your password" autoComplete="current-password"
                      onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                      className={inputCls} style={{ ...inputStyle, paddingRight: 48 }} />
                    <button onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer text-[18px]"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center justify-between">
                  <button onClick={() => setRememberMe(v => !v)}
                    className="flex items-center gap-2 border-none bg-transparent cursor-pointer">
                    <div className="w-5 h-5 rounded-[6px] flex items-center justify-center"
                      style={{ background: rememberMe ? GOLD : 'rgba(255,255,255,0.07)', border: rememberMe ? 'none' : '1.5px solid rgba(255,255,255,0.15)' }}>
                      {rememberMe && <span className="text-[11px] font-black" style={{ color: '#0D0F14' }}>✓</span>}
                    </div>
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Remember me</span>
                  </button>
                  <button onClick={() => navigate('/forgot-password/guest')}
                    className="text-[12px] border-none bg-transparent cursor-pointer"
                    style={{ color: GOLD, fontWeight: 700 }}>Forgot password?</button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px]"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleEmailLogin} disabled={loading}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: loading ? 'rgba(255,255,255,0.4)' : '#0D0F14' }}>
                  {loading ? 'Signing in...' : 'Sign In as Guest →'}
                </motion.button>
              </motion.div>
            )}

            {/* PHONE — input */}
            {tab === 'phone' && phoneStep === 'input' && (
              <motion.div key="phone-input"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-4">
                <Field label="PHONE NUMBER">
                  <div className="flex gap-2">
                    <CountryPicker value={country.code} onChange={(code) => { const found = COUNTRY_CODES.find(c => c.code === code); if (found) setCountry(found); }} />
                    <input type="tel" value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d\s\-()]/g, ''))}
                      placeholder="712 345 678" autoComplete="tel-national"
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      className={`flex-1 ${inputCls}`} style={inputStyle} />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {country.flag} SMS code will be sent to {country.code} {phone || '...'}
                  </p>
                </Field>

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
                  {loading ? 'Sending SMS...' : 'Send Code 📲'}
                </motion.button>
              </motion.div>
            )}

            {/* PHONE — OTP */}
            {tab === 'phone' && phoneStep === 'otp' && (
              <motion.div key="phone-otp"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-5">
                <div className="text-center">
                  <div className="text-[48px] mb-3">📲</div>
                  <div className="text-[17px] font-bold" style={{ color: 'white' }}>Check your messages</div>
                  <div className="text-[13px] mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Code sent to <span style={{ color: GOLD, fontWeight: 700 }}>{country.flag} {country.code} {phone}</span>
                  </div>
                </div>

                <OtpRow otp={otp} onChange={setOtpDigit} idPrefix="glogin-otp" accentColor={GOLD} />

                <div className="text-center">
                  {resend > 0 ? (
                    <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Resend in {resend}s</span>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setPhoneStep('input'); setOtp(['', '', '', '', '', '']); setError(''); }}
                        className="text-[13px] border-none bg-transparent cursor-pointer"
                        style={{ color: GOLD, fontWeight: 700 }}>← Change number</button>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <button onClick={handleSendOTP} className="text-[13px] border-none bg-transparent cursor-pointer"
                        style={{ color: GOLD, fontWeight: 700 }}>Resend</button>
                    </div>
                  )}
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
                  style={{
                    background: otp.join('').length < 6 ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`,
                    color: otp.join('').length < 6 ? 'rgba(255,255,255,0.25)' : '#0D0F14',
                  }}>
                  {loading ? 'Verifying...' : otp.join('').length === 6 ? 'Verifying...' : `${otp.filter(Boolean).length}/6 digits`}
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 text-center space-y-2">
            <div>
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>New here? </span>
              <button onClick={() => navigate('/signup/guest')}
                className="text-[13px] border-none bg-transparent cursor-pointer"
                style={{ color: GOLD, fontWeight: 700 }}>Create guest account</button>
            </div>

            {/* Switch to host — only if they have a host account */}
            <div className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Have a host account? </span>
              <button onClick={() => navigate('/login/host')}
                className="text-[12px] border-none bg-transparent cursor-pointer"
                style={{ color: '#3ECFB2', fontWeight: 700 }}>Switch to Host Login</button>
            </div>
          </div>
        </div>

        
      </motion.div>
    </div>
  );
}
