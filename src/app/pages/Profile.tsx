import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import VerifiedBadge from '../components/VerifiedBadge';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();

  const menuItems = [
    { icon: '👤', label: 'Personal Information', path: '/profile/personal' },
    { icon: '🔒', label: 'Login & Security', path: '/profile/security' },
    { icon: '💳', label: 'Payment Methods', path: '/profile/payments' },
    { icon: '🔔', label: 'Notifications', path: '/profile/notifications' },
    { icon: '❓', label: 'Help Center', path: '/profile/help' },
    { icon: '📄', label: 'Terms & Policies', path: '/profile/terms' },
  ];

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Header */}
        <div
          className="px-6 pt-14 pb-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--lala-gold) 0%, #C8903D 100%)' }}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)' }} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-[32px]"
              style={{
                background: 'rgba(13,15,20,0.15)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255,255,255,0.2)',
                fontWeight: 700,
                color: 'var(--lala-night)'
              }}>
              {currentUser?.name?.[0] || 'G'}
            </div>

            {/* Name */}
            <div className="text-center">
              <div className="text-[22px] mb-1 flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-playfair)', fontWeight: 900, color: 'var(--lala-night)' }}>
                {currentUser?.name || 'Guest User'}
                {currentUser?.verified && <VerifiedBadge size="md" />}
              </div>
              <div className="text-[13px]" style={{ color: 'rgba(13,15,20,0.6)', fontWeight: 500 }}>
                {currentUser?.email || 'guest@lala.ke'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Menu */}
        <div className="px-6 py-5 pb-24">
          <div className="rounded-[20px] overflow-hidden mb-4"
            style={{ background: 'var(--lala-card)', border: '1px solid var(--lala-border)' }}>
            {menuItems.map((item, index) => (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 border-none bg-transparent cursor-pointer text-left"
                style={{
                  borderBottom: index < menuItems.length - 1 ? '1px solid var(--lala-border)' : 'none',
                  color: 'var(--lala-white)'
                }}>
                <span className="text-[20px]">{item.icon}</span>
                <span className="flex-1 text-[14px]" style={{ fontWeight: 500 }}>{item.label}</span>
                <span className="text-[12px]" style={{ color: 'var(--lala-muted)' }}>→</span>
              </motion.button>
            ))}
          </div>

          {/* Switch to Host */}
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            onClick={() => navigate(currentUser?.role === 'host' ? '/host' : '/signup/host')}
            className="w-full py-4 px-5 rounded-[16px] border-none cursor-pointer flex items-center justify-between mb-3"
            style={{
              background: 'linear-gradient(135deg, var(--lala-gold), #C8903D)',
              color: 'var(--lala-night)',
              fontWeight: 700
            }}>
            <span>🏠 Switch to Host Mode</span>
            <span>→</span>
          </motion.button>

          {/* Logout */}
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            onClick={logout}
            className="w-full py-4 px-5 rounded-[16px] border-none cursor-pointer"
            style={{
              background: 'var(--lala-card)',
              border: '1px solid var(--lala-border)',
              color: 'var(--lala-soft)',
              fontWeight: 600
            }}>
            🚪 Logout
          </motion.button>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}