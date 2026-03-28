import { X, Home, Check, Clock, CreditCard, Key, Flag, Phone, Star, DollarSign, Bell, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { notifMeta } from '../utils/notify';

const iconMap: Record<string, any> = { home: Home, check: Check, x: X, clock: Clock, card: CreditCard, key: Key, flag: Flag, phone: Phone, star: Star, money: DollarSign, chat: MessageCircle };

function NotifIcon({ type }: { type: string }) {
  const meta = notifMeta[type] || { icon: 'home', color: '#E8B86D' };
  const Icon = iconMap[meta.icon] || Home;
  return (
    <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: meta.color + '18', border: '1px solid ' + meta.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={15} color={meta.color} />
    </div>
  );
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

interface Props { notifications: any[]; onClose: () => void; onRead: (id: string) => void; onReadAll: () => void; unreadCount: number; }

export default function NotificationPanel({ notifications, onClose, onRead, onReadAll, unreadCount }: Props) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} style={{ position: 'absolute', top: 60, left: 12, right: 12, maxHeight: '70%', overflowY: 'auto', zIndex: 9999, background: '#0c0c0c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
        <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0c0c0c' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Notifications</span>
            {unreadCount > 0 && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{unreadCount} new</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {unreadCount > 0 && <button onClick={onReadAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E8B86D', fontSize: 11, fontWeight: 600 }}>Mark all read</button>}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="rgba(255,255,255,0.4)" /></button>
          </div>
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Bell size={28} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No notifications yet</div>
            <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 4 }}>Bookings, payments and more will appear here</div>
          </div>
        ) : notifications.map((n, i) => (
          <div key={n.id} onClick={() => onRead(n.id)} style={{ padding: '12px 16px', borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.is_read ? 'transparent' : 'rgba(232,184,109,0.03)' }}>
            <NotifIcon type={n.type} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ color: n.is_read ? 'rgba(255,255,255,0.65)' : 'white', fontSize: 13, fontWeight: n.is_read ? 400 : 600, lineHeight: 1.35 }}>{n.title}</div>
                {!n.is_read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B86D', flexShrink: 0, marginTop: 5 }} />}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
              <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10, marginTop: 5 }}>{timeAgo(n.created_at)}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.12)', fontWeight: 700, letterSpacing: 2 }}>LALA KENYA</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
