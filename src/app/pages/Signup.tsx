import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import BackRefreshBar from '../components/BackRefreshBar';
import { supabase } from '../../lib/supabase';
import { openCenteredPopup } from '../lib/oauthPopup';
import { GoogleIcon } from './AuthShared.tsx';
import { useApp } from '../context/AppContext';

export default function Signup() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [gLoading, setGLoading] = useState(false);
  const [gError, setGError] = useState('');

  useEffect(() => {
    if (currentUser) navigate('/home');
  }, [currentUser, navigate]);

  // Ensure we have a profiles row for Google sign-ins started here
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const m = u.user_metadata || {};
        await supabase.from('profiles').upsert(
          {
            id: u.id,
            full_name: m.full_name || m.name || '',
            email: u.email,
            avatar_url: m.avatar_url || m.picture || null,
            role: m.role || 'guest',
          },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogle = async () => {
    setGLoading(true);
    setGError('');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/oauth/callback?next=/home`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      setGError(error.message);
      setGLoading(false);
      return;
    }
    const popup = data?.url ? openCenteredPopup(data.url, 'LALA Kenya — Google') : null;
    if (!popup) {
      setGError('Popup blocked. Please allow popups and try again.');
      setGLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{
          background: 'var(--lala-night)',
          border: '1px solid var(--lala-border)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.6)',
        }}
      >
        <BackRefreshBar />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,184,109,0.12) 0%, transparent 70%)`
        }} />

        <div className="relative z-10 flex flex-col flex-1 px-8 pt-16 pb-10">
          {/* Back arrow to Splash */}
          <button
            onClick={() => navigate('/')}
            className="mb-4 self-start border-none bg-transparent cursor-pointer flex items-center gap-1 text-[13px]"
            style={{ color: 'var(--lala-soft)' }}
          >
            <span style={{ fontSize: 18 }}>←</span>
            <span>Back</span>
          </button>

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)', boxShadow: '0 16px 32px rgba(232,184,109,0.3)' }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'var(--lala-night)' }}>L</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 900, color: 'var(--lala-white)' }}>
              Join LALA Kenya
            </h1>
            <p className="text-[15px] mt-2" style={{ color: 'var(--lala-muted)' }}>
              How would you like to use LALA?
            </p>
          </motion.div>

          {/* Guest Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate('/signup/guest')}
            className="w-full rounded-[20px] p-6 mb-4 text-left cursor-pointer border-none"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)',
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[28px]"
                style={{ background: 'rgba(232,184,109,0.15)' }}>
                🏨
              </div>
              <div>
                <div className="text-[18px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}>
                  I'm a Guest
                </div>
                <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>
                  Find and book stays
                </div>
              </div>
              <div className="ml-auto text-[20px]" style={{ color: 'var(--lala-gold)' }}>→</div>
            </div>
            <div className="flex gap-3">
              {['🔍 Browse properties', '📅 Book instantly', '💬 Message hosts'].map((item, i) => (
                <div key={i} className="text-[11px] px-2.5 py-1 rounded-[20px]"
                  style={{ background: 'rgba(232,184,109,0.1)', color: 'var(--lala-gold)', fontWeight: 500 }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.button>

          {/* Google (Guest) */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleGoogle}
            disabled={gLoading}
            className="w-full py-3.5 rounded-[16px] border-none cursor-pointer mb-4 flex items-center justify-center gap-3"
            style={{
              background: 'white',
              color: '#111',
              fontWeight: 800,
              fontSize: 14,
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              opacity: gLoading ? 0.8 : 1,
              cursor: gLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {gLoading ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" /> : <GoogleIcon />}
            {gLoading ? 'Opening Google...' : 'Continue with Google (Guest)'}
          </motion.button>

          {!!gError && (
            <div className="text-[12px] mb-4 text-center" style={{ color: '#FF6B6B' }}>
              {gError}
            </div>
          )}

          {/* Host Card */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/signup/host')}
            className="w-full rounded-[20px] p-6 mb-8 text-left cursor-pointer border-none"
            style={{
              background: 'linear-gradient(135deg, rgba(232,184,109,0.12), rgba(62,207,178,0.06))',
              border: '1px solid rgba(232,184,109,0.25)',
            }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-[28px]"
                style={{ background: 'rgba(232,184,109,0.2)' }}>
                🏠
              </div>
              <div>
                <div className="text-[18px]" style={{ fontFamily: 'var(--font-playfair)', fontWeight: 800, color: 'var(--lala-white)' }}>
                  I'm a Host
                </div>
                <div className="text-[13px]" style={{ color: 'var(--lala-muted)' }}>
                  List your space & earn
                </div>
              </div>
              <div className="ml-auto text-[20px]" style={{ color: 'var(--lala-gold)' }}>→</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {['💰 Earn money', '📊 Track bookings', '⭐ Build reviews'].map((item, i) => (
                <div key={i} className="text-[11px] px-2.5 py-1 rounded-[20px]"
                  style={{ background: 'rgba(232,184,109,0.15)', color: 'var(--lala-gold)', fontWeight: 500 }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.button>

          {/* Login + browse without account */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-auto space-y-2"
          >
            <div>
              <span className="text-[14px]" style={{ color: 'var(--lala-muted)' }}>
                Already have an account?{' '}
              </span>
              <button
                onClick={() => navigate('/login')}
                style={{
                  color: 'var(--lala-gold)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Sign in
              </button>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="border-none bg-transparent cursor-pointer text-[13px]"
              style={{ color: 'var(--lala-soft)' }}
            >
              Or continue as guest – Browse properties →
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
