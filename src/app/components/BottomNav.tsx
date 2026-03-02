import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

const guestNavItems: NavItem[] = [
  { icon: '🏠', label: 'Explore', path: '/home' },
  { icon: '🗺️', label: 'Map', path: '/map' },
  { icon: '📋', label: 'Trips', path: '/trips' },
  { icon: '💬', label: 'Messages', path: '/messages' },
  { icon: '👤', label: 'Profile', path: '/profile' },
];

const hostNavItems: NavItem[] = [
  { icon: '📊', label: 'Dashboard', path: '/host' },
  { icon: '🏠', label: 'Listings', path: '/host/listings' },
  { icon: '📋', label: 'Bookings', path: '/host/bookings' },
  { icon: '🗺️', label: 'Map', path: '/map' },
  { icon: '💰', label: 'Earnings', path: '/host/earnings' },
  { icon: '👤', label: 'Profile', path: '/host/profile' },
];

interface BottomNavProps {
  type?: 'guest' | 'host';
}

export default function BottomNav({ type = 'guest' }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = type === 'host' ? hostNavItems : guestNavItems;

  return (
    <div
      className="mt-auto py-3 pb-6 px-4 flex justify-between items-center"
      style={{
        background: 'var(--lala-deep)',
        borderTop: '1px solid var(--lala-border)',
      }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 border-none bg-transparent cursor-pointer transition-all flex-1"
            style={{
              color: isActive ? 'var(--lala-gold)' : 'var(--lala-muted)',
              fontWeight: isActive ? 700 : 500,
            }}
          >
            <div
              className="mb-0.5 flex items-center justify-center"
              style={{ height: 30 }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: isActive ? 'rgba(232,184,109,0.18)' : 'transparent',
                }}
              >
                <span
                  className="text-[18px]"
                  style={{
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.18s ease',
                  }}
                >
                  {item.icon}
                </span>
              </div>
            </div>
            <span
              className="text-[11px]"
              style={{ letterSpacing: 0.2 }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}