import { useNavigate, useLocation } from 'react-router-dom';

const GOLD = '#E8B86D';
const TEAL = '#3ECFB2';
const MUTED = 'rgba(255,255,255,0.35)';

interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
}

const svgProps = (color: string) => ({
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
  stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

const HomeIcon = (c: string) => <svg {...svgProps(c)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MapIcon = (c: string) => <svg {...svgProps(c)}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const TripsIcon = (c: string) => <svg {...svgProps(c)}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const MsgIcon = (c: string) => <svg {...svgProps(c)}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const ProfileIcon = (c: string) => <svg {...svgProps(c)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const DashIcon = (c: string) => <svg {...svgProps(c)}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const ListIcon = (c: string) => <svg {...svgProps(c)}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const BookIcon = (c: string) => <svg {...svgProps(c)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>;
const EarnIcon = (c: string) => <svg {...svgProps(c)}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

const mkItem = (icon: (c: string) => JSX.Element, label: string, path: string, active = GOLD): NavItem => ({
  icon: icon(MUTED), activeIcon: icon(active), label, path,
});

const guestNavItems: NavItem[] = [
  mkItem(HomeIcon, 'Explore', '/home'),
  mkItem(MapIcon, 'Map', '/map'),
  mkItem(TripsIcon, 'Trips', '/trips'),
  mkItem(MsgIcon, 'Messages', '/messages'),
  mkItem(ProfileIcon, 'Profile', '/profile'),
];

const hostNavItems: NavItem[] = [
  mkItem(DashIcon, 'Dashboard', '/host', TEAL),
  mkItem(ListIcon, 'Listings', '/host/listings', TEAL),
  mkItem(BookIcon, 'Bookings', '/host/bookings', TEAL),
  mkItem(MapIcon, 'Map', '/host/map', TEAL),
  mkItem(EarnIcon, 'Earnings', '/host/earnings', TEAL),
];

interface BottomNavProps {
  navType?: 'guest' | 'host';
  type?: 'guest' | 'host';
}

export default function BottomNav({ navType, type }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = navType || type || 'guest';
  const items = role === 'host' ? hostNavItems : guestNavItems;
  const activeColor = role === 'host' ? TEAL : GOLD;
  const activeBg = role === 'host' ? 'rgba(62,207,178,0.12)' : 'rgba(232,184,109,0.12)';

  return (
    <div className="py-3 pb-6 px-2 flex justify-between items-center"
      style={{ background: 'rgba(8,6,8,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer flex-1"
            style={{ color: isActive ? activeColor : MUTED }}>
            <div className="flex items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 10, background: isActive ? activeBg : 'transparent', transition: 'all 0.2s' }}>
              {isActive ? item.activeIcon : item.icon}
            </div>
            <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: 0.3 }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
