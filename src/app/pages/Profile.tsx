import PhoneFrame from '../components/PhoneFrame';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import BackRefreshBar from '../components/BackRefreshBar';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext.tsx';

export default function Profile() {
  const { t } = useLanguage();
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  const menuItems = [
    { icon: '👤', label: t('profile.personal_info'), path: '/profile/personal', color: '#E8B86D' },
    { icon: '🔐', label: t('profile.login_security'), path: '/profile/security', color: '#3ECFB2' },
    { icon: '💳', label: t('profile.payment_methods'), path: '/profile/payments', color: '#E8B86D' },
    { icon: '🔔', label: t('profile.notifications'), path: '/profile/notifications', color: '#3ECFB2' },
    { icon: '❓', label: t('profile.help_center'), path: '/profile/help', color: '#E8B86D' },
    { icon: '📄', label: t('profile.terms_policies'), path: '/profile/terms', color: 'rgba(255,255,255,0.4)' },
  ];

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'G';

  return (
    <PhoneFrame>
      <div className="flex flex-col h-full" style={{ background: 'linear-gradient(170deg, #0e0b08 0%, #080608 60%, #060408 100%)' }}>
      <BackRefreshBar />

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(232,184,109,0.12) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,184,109,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(232,184,109,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 overflow-y-auto pb-2" style={{ scrollbarWidth: 'none' }}>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center pt-10 pb-8 px-6 relative"
        >
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative mb-4"
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full"
              style={{ margin: -4, border: '1.5px solid rgba(232,184,109,0.3)', borderRadius: '50%' }} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                margin: -8,
                background: 'conic-gradient(from 0deg, rgba(232,184,109,0.4) 0deg, transparent 120deg, rgba(232,184,109,0.1) 240deg, transparent 360deg)',
                borderRadius: '50%',
              }}
            />

            {/* Avatar circle */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: currentUser?.avatar
                  ? 'transparent'
                  : 'linear-gradient(145deg, #F7DC8A, #E8B86D, #C8843A)',
                boxShadow: '0 16px 48px rgba(232,184,109,0.4), 0 4px 16px rgba(0,0,0,0.6)',
              }}>
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 900, color: '#1a0800', fontFamily: 'var(--font-playfair)' }}>{initials}</span>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center">
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 4 }}>
              {currentUser?.name || 'Guest User'}
            </h2>
            <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentUser?.email || 'Not signed in'}</p>
            {/* Role badge */}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(232,184,109,0.1)',
                border: '1px solid rgba(232,184,109,0.2)',
              }}>
              <span style={{ fontSize: 12 }}>🏨</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#E8B86D', letterSpacing: '1px' }}>
                {currentUser?.role === 'host' ? 'HOST' : 'GUEST'}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="mx-6 h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(232,184,109,0.15), transparent)' }} />

        {/* Menu items */}
        <div className="px-5 flex flex-col gap-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 rounded-[16px] border-none cursor-pointer text-left"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="w-9 h-9 rounded-[12px] flex items-center justify-center text-[18px] flex-shrink-0"
                style={{
                  background: `${item.color}18`,
                  border: `1px solid ${item.color}30`,
                }}>
                {item.icon}
              </div>
              <span className="flex-1 text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>›</span>
            </motion.button>
          ))}
        </div>

        {/* Switch to Host */}
        {currentUser?.role !== 'host' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="px-5 mt-4">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login/host')}
              className="w-full p-4 rounded-[16px] border-none cursor-pointer flex items-center justify-between"
              style={{
                background: 'linear-gradient(135deg, rgba(62,207,178,0.12), rgba(62,207,178,0.04))',
                border: '1px solid rgba(62,207,178,0.25)',
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 20 }}>🏠</span>
                <div className="text-left">
                  <div className="text-[13px] font-bold" style={{ color: '#3ECFB2' }}>Switch to Host Mode</div>
                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>List your property & earn</div>
                </div>
              </div>
              <span style={{ color: '#3ECFB2', fontSize: 18 }}>→</span>
            </motion.button>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="px-5 mt-3 mb-4">
          <button
            onClick={logout}
            className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[13px] font-bold"
            style={{ background: 'rgba(255,107,107,0.06)', color: 'rgba(255,107,107,0.7)', border: '1px solid rgba(255,107,107,0.12)' }}
          >
            Logout
          </button>
        </motion.div>
      </div>

      <BottomNav type="guest" />
    </div>
    </PhoneFrame>
  );
}