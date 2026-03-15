import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext.tsx';

const TEAL = '#3ECFB2';
const GOLD = '#E8B86D';

const s = (color: string) => ({ width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

const ListingsIcon = () => <svg {...s(TEAL)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PayoutIcon = () => <svg {...s(TEAL)}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const InsightsIcon = () => <svg {...s(TEAL)}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const BookingsIcon = () => <svg {...s(TEAL)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const EarningsIcon = () => <svg {...s(TEAL)}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const ResourcesIcon = () => <svg {...s(TEAL)}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const AccountIcon = () => <svg {...s(TEAL)}><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>;
const SwitchIcon = () => <svg {...s(GOLD)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg {...s('rgba(255,100,100,0.8)')}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ArrowIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

const menuItems = [
  { Icon: ListingsIcon, label: 'My Listings', sub: 'Manage your properties', path: '/host/listings' },
  { Icon: PayoutIcon, label: 'Payout Methods', sub: 'Bank & M-Pesa settings', path: '/host/settings/payouts' },
  { Icon: InsightsIcon, label: 'Performance Insights', sub: 'Views, bookings & trends', path: '/host/settings/insights' },
  { Icon: BookingsIcon, label: 'All Bookings', sub: 'Upcoming & past stays', path: '/host/bookings' },
  { Icon: EarningsIcon, label: 'Earnings', sub: 'Revenue & payouts', path: '/host/earnings' },
  { Icon: ResourcesIcon, label: 'Host Resources', sub: 'Tips & support guides', path: '/host/settings/resources' },
  { Icon: AccountIcon, label: 'Account Settings', sub: 'Personal info & security', path: '/host/settings/account' },
];

export default function HostProfile() {

  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const initials = currentUser?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'H';

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#03020a' }}>
      <div className="w-full max-w-[390px] h-[844px] rounded-[44px] overflow-hidden flex flex-col relative"
        style={{ background: '#0a0d0c', border: '1px solid rgba(62,207,178,0.1)', boxShadow: '0 60px 120px rgba(0,0,0,0.9)' }}>

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(62,207,178,0.08) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(62,207,178,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(62,207,178,0.02) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex flex-col flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

          {/* Header */}
          <div className="px-6 pt-14 pb-8 relative overflow-hidden">
            {/* Teal accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${TEAL}, transparent)` }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <motion.div whileHover={{ scale: 1.05 }}
                  className="w-22 h-22 rounded-full flex items-center justify-center text-[28px] font-black"
                  style={{ width: 88, height: 88, background: `linear-gradient(135deg, ${TEAL}, #2AA893)`, color: '#06100e', boxShadow: `0 0 0 3px rgba(62,207,178,0.2), 0 16px 40px rgba(62,207,178,0.3)` }}>
                  {currentUser?.avatar
                    ? <img src={currentUser.avatar} className="w-full h-full rounded-full object-cover" />
                    : initials}
                </motion.div>
                {/* Host badge */}
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                  style={{ background: `linear-gradient(135deg, ${TEAL}, #2AA893)`, color: '#06100e', border: '2px solid #0a0d0c' }}>
                  HOST
                </div>
              </div>

              <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 4 }}>
                {currentUser?.name || 'Host'}
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{currentUser?.email}</p>
              {currentUser?.phone && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{currentUser.phone}</p>
              )}

              {/* Stats row */}
              <div className="flex gap-6 mt-5 px-6 py-3 rounded-[16px] w-full justify-center"
                style={{ background: 'rgba(62,207,178,0.06)', border: '1px solid rgba(62,207,178,0.12)' }}>
                {[{ label: 'Properties', val: '—' }, { label: 'Bookings', val: '—' }, { label: 'Rating', val: '—' }].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center">
                    <span style={{ fontSize: 16, fontWeight: 800, color: TEAL }}>{stat.val}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Menu */}
          <div className="px-5 pb-4">
            <div className="rounded-[20px] overflow-hidden mb-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(62,207,178,0.08)' }}>
              {menuItems.map((item, i) => (
                <motion.button key={item.path}
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.98 }} onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 border-none bg-transparent cursor-pointer text-left"
                  style={{ borderBottom: i < menuItems.length - 1 ? '1px solid rgba(62,207,178,0.06)' : 'none' }}>
                  <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.12)' }}>
                    <item.Icon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.sub}</div>
                  </div>
                  <ArrowIcon />
                </motion.button>
              ))}
            </div>

            {/* Switch to Guest */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }} onClick={() => navigate('/home')}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] border-none cursor-pointer mb-2"
              style={{ background: 'rgba(232,184,109,0.06)', border: '1px solid rgba(232,184,109,0.15)' }}>
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(232,184,109,0.08)', border: '1px solid rgba(232,184,109,0.15)' }}>
                <SwitchIcon />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', textAlign: 'left' }}>Switch to Guest Mode</span>
              <ArrowIcon />
            </motion.button>

            {/* Logout */}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              whileTap={{ scale: 0.97 }} onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] border-none cursor-pointer"
              style={{ background: 'rgba(255,80,80,0.05)', border: '1px solid rgba(255,80,80,0.12)' }}>
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.12)' }}>
                <LogoutIcon />
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,100,100,0.8)', textAlign: 'left' }}>Log Out</span>
            </motion.button>
          </div>
        </div>

        <div className="relative z-10">
          <BottomNav navType="host" />
        </div>
      </div>
    </div>
  );
}
