import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import BackRefreshBar from '../components/BackRefreshBar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { COUNTRY_CODES, CountryCode, GoogleIcon, CountryPicker, OtpRow } from './AuthShared.tsx';
import { openCenteredPopup } from '../lib/oauthPopup';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

type Tab = 'email' | 'phone';

const GOLD = '#E8B86D';
const CARD = 'rgba(255,255,255,0.05)';
const BORDER = '1px solid rgba(255,255,255,0.09)';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] font-black block mb-1.5"
      style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 1.2 }}>{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-3.5 rounded-[14px] text-[14px] outline-none";
const inputStyle = { background: CARD, border: BORDER, color: 'white' };

export default function Login() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('email');

  // Email
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone
  const [country, setCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [phone, setPhone] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resend, setResend] = useState(0);

  // Shared
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (currentUser) navigate('/home'); }, [currentUser]);

  useEffect(() => {
    if (resend <= 0) return;
    const timer = setTimeout(() => setResend(v => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resend]);

  // Auto-submit OTP when all 6 digits filled
  useEffect(() => {
    if (otp.join('').length === 6 && phoneStep === 'otp') handleVerifyOTP();
  }, [otp]);

  // Google callback
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

  const reset = () => { setError(''); setLoading(false); };

  const handleEmailLogin = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return; }
    if (!password) { setError('Please enter your password'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) { setError(error.message); setLoading(false); return; }
    navigate('/home');
  };

  const fullPhone = `${country.code}${phone.replace(/^0+/, '').replace(/\D/g, '')}`;

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 6) { setError('Enter a valid phone number'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false); setPhoneStep('otp'); setResend(60); setOtp(['','','','','','']);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: code, type: 'sms' });
    if (error) { setError(error.message); setLoading(false); return; }
    navigate('/home');
  };

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

  const setOtpDigit = (i: number, val: string) => {
    const next = [...otp]; next[i] = val; setOtp(next);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#06060c' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: '#0D0F14', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <BackRefreshBar />

        {/* Subtle gold glow top */}
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,184,109,0.08) 0%, transparent 100%)' }} />

        <div className="relative z-10 flex flex-col flex-1 px-7 pt-14 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher compact />
          </div>

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center mx-auto mb-3"
              style={{ background: `linear-gradient(135deg, ${GOLD}, #C8903D)`, boxShadow: `0 16px 40px rgba(232,184,109,0.3)` }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: '#0D0F14' }}>L</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'white' }}>{t('auth.welcome_back')}</h1>
            <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('auth.sign_in_to_account')}</p>
          </motion.div>

          {/* ── Google ── */}
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            onClick={handleGoogle} disabled={gLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-[16px] border-none cursor-pointer mb-2 flex items-center justify-center gap-3"
            style={{ background: 'white', color: '#111', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.5)', opacity: gLoading ? 0.8 : 1 }}>
            {gLoading ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> : <GoogleIcon />}
            {gLoading ? t('auth.opening_google') : t('auth.continue_with_google')}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{t('auth.or_continue_with')}</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* ── Tab toggle ── */}
          <div className="flex rounded-[14px] p-1 mb-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['email', 'phone'] as Tab[]).map(t => (
              <button key={t}
                onClick={() => { setTab(t); reset(); setPhoneStep('input'); setOtp(['','','','','','']); }}
                className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: tab === t ? GOLD : 'transparent',
                  color: tab === t ? '#0D0F14' : 'rgba(255,255,255,0.4)',
                }}>
                {t === 'email' ? `✉️ ${t('auth.email')}` : `📱 ${t('auth.phone')}`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══ EMAIL ══ */}
            {tab === 'email' && (
              <motion.div key="email"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="flex flex-col gap-4">
                <Field label={t('auth.email_address')}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                    className={inputCls} style={inputStyle} />
                </Field>
                <Field label={t('auth.password')}>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t('auth.min_characters')} autoComplete="current-password"
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
                  {/* Remember me */}
                  <button onClick={() => setRememberMe(v => !v)}
                    className="flex items-center gap-2 border-none bg-transparent cursor-pointer">
                    <div className="w-5 h-5 rounded-[6px] flex items-center justify-center border-none"
                      style={{ background: rememberMe ? GOLD : 'rgba(255,255,255,0.07)', border: rememberMe ? 'none' : '1.5px solid rgba(255,255,255,0.15)' }}>
                      {rememberMe && <span className="text-[11px] font-black" style={{ color: '#0D0F14' }}>✓</span>}
                    </div>
                    <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('auth.remember_me')}</span>
                  </button>
                  <button onClick={() => navigate('/forgot-password')}
                    className="text-[12px] border-none bg-transparent cursor-pointer"
                    style={{ color: GOLD, fontWeight: 700 }}>{t('auth.forgot_password')}</button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-[12px] text-[13px] flex items-start gap-2"
                      style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleEmailLogin} disabled={loading}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`, color: loading ? 'rgba(255,255,255,0.4)' : '#0D0F14' }}>
                  {loading ? t('auth.signing_in') : `${t('auth.sign_in')} →`}
                </motion.button>
              </motion.div>
            )}

            {/* ══ PHONE — ENTER NUMBER ══ */}
            {tab === 'phone' && phoneStep === 'input' && (
              <motion.div key="phone-input"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="flex flex-col gap-4">
                <Field label={t('auth.phone_number')}>
                  <div className="flex gap-2">
                    {/* Country code button */}
                    <motion.button whileTap={{ scale: 0.97 }}
                      onClick={() => setShowPicker(true)}
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
                      placeholder="712 345 678"
                      autoComplete="tel-national"
                      onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                      className={`flex-1 ${inputCls}`} style={inputStyle} />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {country.flag} {t('auth.phone_login_requires_sms')}
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
                  {loading ? t('auth.sending_sms') : t('auth.send_code_sms')}
                </motion.button>

                <div className="px-4 py-3 rounded-[14px]"
                  style={{ background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.12)' }}>
                  <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    📞 <strong style={{ color: 'rgba(62,207,178,0.9)' }}>Phone login</strong> requires SMS to be enabled in Supabase. No password needed — just your number and the code we send.
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ PHONE — OTP ══ */}
            {tab === 'phone' && phoneStep === 'otp' && (
              <motion.div key="phone-otp"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-5">
                <div className="text-center">
                  <div className="text-[48px] mb-3">📲</div>
                  <div className="text-[17px] font-bold" style={{ color: 'white' }}>{t('auth.check_messages')}</div>
                  <div className="text-[13px] mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {t('auth.code_sent_to')}<br/>
                    <span style={{ color: GOLD, fontWeight: 700 }}>{country.flag} {country.code} {phone}</span>
                  </div>
                </div>

                <OtpRow otp={otp} onChange={setOtpDigit} idPrefix="login-otp" accentColor={GOLD} />

                <div className="text-center">
                  {resend > 0 ? (
                    <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {t('auth.resend_in', { resend })}
                    </span>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => { setPhoneStep('input'); setOtp(['','','','','','']); setError(''); }}
                        className="text-[13px] border-none bg-transparent cursor-pointer"
                        style={{ color: GOLD, fontWeight: 700 }}>{t('auth.change_number')}</button>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <button onClick={handleSendOTP} className="text-[13px] border-none bg-transparent cursor-pointer"
                        style={{ color: GOLD, fontWeight: 700 }}>{t('auth.resend_code')}</button>
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

                <motion.button whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
                  style={{
                    background: otp.join('').length < 6 ? 'rgba(255,255,255,0.07)' : `linear-gradient(135deg, ${GOLD}, #C8903D)`,
                    color: otp.join('').length < 6 ? 'rgba(255,255,255,0.25)' : '#0D0F14',
                  }}>
                  {loading ? t('auth.verifying') : otp.join('').length === 6 ? t('auth.verifying') : `${t('auth.enter_all_digits')} (${otp.filter(Boolean).length}/6)`}
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('auth.already_have_account')} </span>
            <button onClick={() => navigate('/signup')}
              className="text-[13px] border-none bg-transparent cursor-pointer"
              style={{ color: GOLD, fontWeight: 700 }}>{t('auth.create_account')}</button>
          </div>
          <button onClick={() => navigate('/')}
            className="mt-3 text-[12px] w-full border-none bg-transparent cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.25)' }}>{t('auth.back_to_home')}</button>
        </div>

        {/* Country Picker */}
        <CountryPicker
          visible={showPicker}
          selected={country}
          onSelect={setCountry}
          onClose={() => setShowPicker(false)}
          accentColor={GOLD}
        />
      </motion.div>
    </div>
  );
}