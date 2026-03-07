import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import BackRefreshBar from '../components/BackRefreshBar';
import { supabase } from '../../lib/supabase';
import { openCenteredPopup } from '../lib/oauthPopup';
import { GoogleIcon } from './AuthShared.tsx';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export default function Signup() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { t } = useLanguage();
  const [gLoading, setGLoading] = useState(false);
  const [gError, setGError] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'host') navigate('/host');
      else navigate('/home');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const m = u.user_metadata || {};
        await supabase.from('profiles').upsert(
          { id: u.id, full_name: m.full_name || m.name || '', email: u.email, avatar_url: m.avatar_url || m.picture || null, role: m.role || 'guest' },
          { onConflict: 'id', ignoreDuplicates: true }
        );
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogle = async () => {
    setGLoading(true); setGError('');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/oauth/callback?next=/`, queryParams: { access_type: 'offline', prompt: 'consent' }, skipBrowserRedirect: true },
    });
    if (error) { setGError(error.message); setGLoading(false); return; }
    const popup = data?.url ? openCenteredPopup(data.url, 'LALA Kenya — Google') : null;
    if (!popup) { setGError('Popup blocked. Please allow popups and try again.'); setGLoading(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#040304' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(232,184,109,0.08) 0%, transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)', border: '1px solid rgba(232,184,109,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)' }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(232,184,109,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,184,109,0.1) 0%, transparent 70%)' }} />

        <BackRefreshBar />

        <div className="relative z-10 flex flex-col flex-1 px-6 pt-10 pb-8 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
              className="flex items-center gap-1.5 border-none bg-transparent cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
              <span style={{ fontSize: 16 }}>←</span> {t('auth.back')}
            </motion.button>
            <LanguageSwitcher compact />
          </div>

          {/* Logo + Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-4 relative"
              style={{ background: 'linear-gradient(145deg, #F7DC8A, #E8B86D, #C8843A)', boxShadow: '0 16px 40px rgba(232,184,109,0.4)' }}>
              <div className="absolute inset-0 rounded-[20px]" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 900, color: '#1a0800' }}>L</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>
              {t('auth.join_lala_kenya')}
            </h1>
            <p className="text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {t('auth.how_use_lala')}
            </p>
          </motion.div>

          {/* Guest Card */}
          <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.98 }} onClick={() => navigate('/signup/guest')}
            className="w-full rounded-[22px] p-5 mb-3 text-left cursor-pointer border-none relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="absolute inset-0 rounded-[22px] opacity-0 hover:opacity-100 transition-opacity" style={{ background: 'rgba(232,184,109,0.04)' }} />
            <div className="flex items-center gap-4 mb-3">
              <div className="w-13 h-13 rounded-[16px] flex items-center justify-center text-[26px] flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.15)', width: 52, height: 52 }}>
                🏨
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-bold mb-0.5" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>
                  {t('auth.im_guest')}
                </div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('auth.find_book_stays')}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.15)', color: '#E8B86D', fontSize: 14 }}>→</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['🔍 Browse properties', '📅 Book instantly', '💬 Message hosts'].map((item, i) => (
                <div key={i} className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(232,184,109,0.08)', color: '#E8B86D', border: '1px solid rgba(232,184,109,0.15)' }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.button>

          {/* Google Button */}
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            whileTap={{ scale: 0.97 }} onClick={handleGoogle} disabled={gLoading}
            className="w-full py-3.5 rounded-[16px] border-none cursor-pointer mb-3 flex items-center justify-center gap-3"
            style={{ background: 'white', color: '#111', fontWeight: 700, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', opacity: gLoading ? 0.8 : 1 }}>
            {gLoading
              ? <div className="w-5 h-5 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
              : <GoogleIcon />}
            {gLoading ? t('auth.opening_google') : `${t('auth.continue_with_google')} (${t('auth.im_guest')})`}
          </motion.button>

          {gError && <p className="text-[11px] mb-3 text-center" style={{ color: '#FF6B6B' }}>{gError}</p>}

          {/* Host Card */}
          <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            whileTap={{ scale: 0.98 }} onClick={() => navigate('/signup/host')}
            className="w-full rounded-[22px] p-5 mb-6 text-left cursor-pointer border-none relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(232,184,109,0.09), rgba(62,207,178,0.04))', border: '1px solid rgba(232,184,109,0.2)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.3), transparent)' }} />
            <div className="flex items-center gap-4 mb-3">
              <div className="w-13 h-13 rounded-[16px] flex items-center justify-center text-[26px] flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.15)', border: '1px solid rgba(232,184,109,0.2)', width: 52, height: 52 }}>
                🏠
              </div>
              <div className="flex-1">
                <div className="text-[17px] font-bold mb-0.5" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>
                  {t('auth.im_host')}
                </div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {t('auth.list_space_earn')}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.2)', color: '#E8B86D', fontSize: 14 }}>→</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['💰 Earn money', '📊 Track bookings', '⭐ Build reviews'].map((item, i) => (
                <div key={i} className="text-[10px] px-2.5 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(232,184,109,0.12)', color: '#E8B86D', border: '1px solid rgba(232,184,109,0.2)' }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.button>

          {/* Bottom links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-center space-y-2 mt-auto">
            <div>
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {t('auth.already_have_account')}{' '}
              </span>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/login')}
                className="border-none bg-transparent cursor-pointer text-[13px] font-bold"
                style={{ color: '#E8B86D' }}>
                {t('auth.sign_in')}
              </motion.button>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/home')}
              className="border-none bg-transparent cursor-pointer text-[12px]"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              {t('auth.continue_as_guest')}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
