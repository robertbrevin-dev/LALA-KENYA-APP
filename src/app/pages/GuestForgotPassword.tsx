import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';

const GOLD = '#E8B86D';

export default function GuestForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?role=guest`,
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col items-center justify-center px-8"
          style={{ background: 'linear-gradient(170deg, #0e0b08, #080608)', border: '1px solid rgba(232,184,109,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6"
            style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.25)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </motion.div>
          <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 900, color: 'white', textAlign: 'center', marginBottom: 12 }}>Check your email!</h2>
          <p className="text-[13px] text-center mb-3" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8 }}>We sent a password reset link to</p>
          <div className="px-5 py-3 rounded-[14px] mb-8" style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.25)' }}>
            <p className="text-[15px] font-bold text-center" style={{ color: GOLD }}>{email}</p>
          </div>
          <p className="text-[12px] text-center mb-8" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
            Click the link in your email to reset your password. Check your spam folder if you don't see it.
          </p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/login/guest')}
            className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #C8843A)`, color: '#1a0800' }}>
            Back to Guest Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: 'linear-gradient(170deg, #0e0b08, #080608)', border: '1px solid rgba(232,184,109,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,184,109,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10 flex flex-col flex-1 px-8 pt-16 pb-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/login/guest')}
            className="mb-10 self-start border-none bg-transparent cursor-pointer flex items-center gap-1.5"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            &#8592; Back to Guest Login
          </motion.button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-5"
              style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.2)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 8 }}>Forgot Password?</h1>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>Enter your guest account email and we'll send you a reset link.</p>
          </motion.div>
          <div className="mb-6">
            <label className="text-[11px] mb-2 block font-bold" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>EMAIL ADDRESS</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && handleReset()}
              className="w-full px-4 py-4 rounded-[14px] text-[14px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }} />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-[12px] text-[13px] mb-4"
              style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
              {error}
            </div>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleReset} disabled={loading}
            className="w-full py-4 rounded-[16px] border-none cursor-pointer font-bold text-[15px]"
            style={{ background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${GOLD}, #C8843A)`, color: loading ? 'rgba(255,255,255,0.4)' : '#1a0800' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
