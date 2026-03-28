import { Bell } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props { onOpen: () => void; }

export default function NotificationBell({ onOpen }: Props) {
  const { unreadCount } = useApp();
  return (
    <button onClick={onOpen} style={{ width: 36, height: 36, borderRadius: 13, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
      <Bell size={15} color="rgba(255,255,255,0.7)" />
      {unreadCount > 0 && (
        <div style={{ position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16, borderRadius: 8, background: '#E8B86D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', fontSize: 9, fontWeight: 800, color: '#000', border: '1.5px solid #000' }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </div>
      )}
    </button>
  );
}
