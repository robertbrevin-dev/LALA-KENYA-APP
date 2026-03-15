import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext.tsx';

const GOLD = '#E8B86D';
const TEAL = '#3ECFB2';

export default function RoleSelect() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { mode } = useParams();
  const isSignup = mode === 'signup';

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden relative flex flex-col"
        style={{ background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)', border: '1px solid rgba(232,184,109,0.1)', boxShadow: '0 80px 160px rgba(0,0,0,0.95)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(232,184,109,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col flex-1 px-7 pt-10 pb-10">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/')}
            className="mb-8 self-start border-none bg-transparent cursor-pointer flex items-center gap-1.5"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            ← {t('auth.back')}
          </motion.button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-5 relative"
              style={{ background: 'linear-gradient(145deg, #F7DC8A, #E8B86D, #C8843A)', boxShadow: '0 16px 40px rgba(232,184,109,0.4)' }}>
              <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 900, color: '#1a0800' }}>L</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 30, fontWeight: 900, color: 'white', marginBottom: 8 }}>
              {isSignup ? t('auth.join_lala_kenya') : t('auth.welcome_back')}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)' }}>
              {isSignup ? t('auth.how_use_lala') : t('auth.which_account_signing')}
            </p>
          </motion.div>
          <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(isSignup ? '/signup/guest' : '/login/guest')}
            className="w-full rounded-[22px] p-5 mb-4 text-left cursor-pointer border-none relative overflow-hidden"
            style={{ background: 'rgba(232,184,109,0.06)', border: '1.5px solid rgba(232,184,109,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.2)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="flex-1">
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 3 }}>{t('auth.im_guest')}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{isSignup ? t('auth.find_book_stays') : t('auth.sign_in_guest')}</div>
              </div>
              <div style={{ color: GOLD, fontSize: 20 }}>→</div>
            </div>
          </motion.button>
          <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(isSignup ? '/signup/host' : '/login/host')}
            className="w-full rounded-[22px] p-5 mb-10 text-left cursor-pointer border-none relative overflow-hidden"
            style={{ background: 'rgba(62,207,178,0.05)', border: '1.5px solid rgba(62,207,178,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="flex-1">
                <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 3 }}>{t('auth.im_host')}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{isSignup ? t('auth.list_space_earn') : t('auth.sign_in_host')}</div>
              </div>
              <div style={{ color: TEAL, fontSize: 20 }}>→</div>
            </div>
          </motion.button>
          
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-[22px] p-4 mb-6 text-center cursor-pointer border-none relative overflow-hidden"
            style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0L12 2l-5.64 4.64a9 9 0 0 1 0 12.73L12 22l6.36-9.36z"/>
              </svg>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{t('auth.continue_with_google')}</span>
            </div>
          </motion.button>

          <div className="text-center mt-auto">
            {isSignup ? (
              <div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t('auth.already_have_account')} </span>
                <button onClick={() => navigate('/role/login')} className="border-none bg-transparent cursor-pointer" style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>{t('auth.sign_in')}</button>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{t('auth.new_to_lala')} </span>
                <button onClick={() => navigate('/role/signup')} className="border-none bg-transparent cursor-pointer" style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>{t('auth.sign_up')}</button>
              </div>
            )}
            <button onClick={() => navigate('/home')} className="border-none bg-transparent cursor-pointer block w-full mt-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>
              {t('auth.continue_as_guest')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
