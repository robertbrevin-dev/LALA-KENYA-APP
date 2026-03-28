# -*- coding: utf-8 -*-

# Update notify.ts - clean Pinterest style, no emojis
notify = '''import { supabase } from '../../lib/supabase';

type NotifType = 'inquiry' | 'accepted' | 'declined' | 'expired' | 'payment_full' | 'payment_deposit' | 'cancelled' | 'checkin' | 'checkout' | 'missed_call' | 'review_request' | 'payout';

interface NotifParams {
  userId: string;
  type: NotifType;
  bookingId?: string;
  propertyTitle?: string;
  guestName?: string;
  hostName?: string;
  amount?: number;
  nights?: number;
  checkIn?: string;
  extra?: Record<string, any>;
}

export const notifMeta: Record<NotifType, { icon: string; color: string; label: string }> = {
  inquiry:         { icon: 'home',    color: '#E8B86D', label: 'New Request' },
  accepted:        { icon: 'check',   color: '#3ECFB2', label: 'Accepted' },
  declined:        { icon: 'x',       color: '#FF6B6B', label: 'Declined' },
  expired:         { icon: 'clock',   color: '#888',    label: 'Expired' },
  payment_full:    { icon: 'card',    color: '#3ECFB2', label: 'Payment' },
  payment_deposit: { icon: 'card',    color: '#E8B86D', label: 'Deposit' },
  cancelled:       { icon: 'x',       color: '#FF6B6B', label: 'Cancelled' },
  checkin:         { icon: 'key',     color: '#3ECFB2', label: 'Check-in' },
  checkout:        { icon: 'flag',    color: '#E8B86D', label: 'Checkout' },
  missed_call:     { icon: 'phone',   color: '#FF6B6B', label: 'Missed Call' },
  review_request:  { icon: 'star',    color: '#E8B86D', label: 'Review' },
  payout:          { icon: 'money',   color: '#3ECFB2', label: 'Payout' },
};

const templates: Record<NotifType, (p: NotifParams) => { title: string; body: string }> = {
  inquiry: (p) => ({
    title: `${p.guestName} wants to book`,
    body: `${p.propertyTitle} · ${p.nights} night${p.nights !== 1 ? 's' : ''} from ${p.checkIn}. Respond within 5 minutes.`,
  }),
  accepted: (p) => ({
    title: `Your booking was accepted`,
    body: `${p.propertyTitle} is yours. Complete payment within 30 minutes to confirm your stay.`,
  }),
  declined: (p) => ({
    title: `Booking request declined`,
    body: `${p.propertyTitle} is unavailable for your dates. Explore other listings on Lala Kenya.`,
  }),
  expired: (p) => ({
    title: `Booking request expired`,
    body: `Your request for ${p.propertyTitle} has expired. Try submitting a new inquiry.`,
  }),
  payment_full: (p) => ({
    title: `Payment confirmed · Ksh ${p.amount?.toLocaleString()}`,
    body: `${p.propertyTitle} is secured. Check in on ${p.checkIn}. Lala Kenya holds your payment until arrival.`,
  }),
  payment_deposit: (p) => ({
    title: `Deposit received · Ksh ${p.amount?.toLocaleString()}`,
    body: `50% deposit for ${p.propertyTitle} confirmed. Pay balance before ${p.checkIn}.`,
  }),
  cancelled: (p) => ({
    title: `Booking cancelled`,
    body: `${p.propertyTitle} booking was cancelled. Refund processed per Lala Kenya policy.`,
  }),
  checkin: (p) => ({
    title: `${p.guestName} has checked in`,
    body: `${p.propertyTitle} · Your payout of Ksh ${p.amount?.toLocaleString()} is released at checkout.`,
  }),
  checkout: (p) => ({
    title: `Stay complete · Ksh ${p.amount?.toLocaleString()} earned`,
    body: `${p.guestName} checked out of ${p.propertyTitle}. Payout is being processed by Lala Kenya.`,
  }),
  missed_call: (p) => ({
    title: `Missed call`,
    body: `${p.guestName || p.hostName} tried to reach you on Lala Kenya.`,
  }),
  review_request: (p) => ({
    title: `How was your stay?`,
    body: `Share your experience at ${p.propertyTitle} to help other travellers on Lala Kenya.`,
  }),
  payout: (p) => ({
    title: `Payout sent · Ksh ${p.amount?.toLocaleString()}`,
    body: `Your earnings for ${p.propertyTitle} have been sent to your account.`,
  }),
};

export async function sendNotification(params: NotifParams) {
  const template = templates[params.type](params);
  const { error } = await supabase.from('notifications').insert({
    user_id: params.userId,
    type: params.type,
    title: template.title,
    body: template.body,
    data: { booking_id: params.bookingId, property_title: params.propertyTitle, ...params.extra },
    is_read: false,
  });
  if (error) console.error('Notification error:', error.message);
}
'''

with open('src/app/utils/notify.ts', 'w', encoding='utf-8') as f:
    f.write(notify)
print("notify.ts updated")

# Update NotificationBell.tsx - Pinterest style
bell = '''import { useState } from 'react';
import { Bell, X, Home, Check, Clock, CreditCard, Key, Flag, Phone, Star, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { notifMeta } from '../utils/notify';

const iconMap: Record<string, any> = {
  home: Home, check: Check, x: X, clock: Clock, card: CreditCard,
  key: Key, flag: Flag, phone: Phone, star: Star, money: DollarSign,
};

function NotifIcon({ type }: { type: string }) {
  const meta = notifMeta[type as keyof typeof notifMeta] || { icon: 'home', color: '#E8B86D', label: '' };
  const Icon = iconMap[meta.icon] || Home;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
      background: meta.color + '18', border: '1px solid ' + meta.color + '40',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={16} color={meta.color} />
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return Math.floor(hrs / 24) + 'd ago';
}

export default function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 36, height: 36, borderRadius: 13,
          border: '1px solid rgba(255,255,255,0.08)',
          background: open ? 'rgba(232,184,109,0.1)' : 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
        }}
      >
        <Bell size={15} color={open ? '#E8B86D' : 'rgba(255,255,255,0.7)'} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -3, right: -3, minWidth: 16, height: 16,
            borderRadius: 8, background: '#E8B86D', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            fontSize: 9, fontWeight: 800, color: '#000', border: '1.5px solid #000',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 9998 }} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: 44, right: 0, width: 320, maxHeight: 480,
                overflowY: 'auto', zIndex: 9999,
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{
                padding: '14px 16px 10px', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 1,
              }}>
                <div>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#E8B86D', fontSize: 11, fontWeight: 600,
                    }}>
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <X size={14} color="rgba(255,255,255,0.4)" />
                  </button>
                </div>
              </div>

              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Bell size={28} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 12px' }} />
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>No notifications yet</div>
                  <div style={{ color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 4 }}>
                    We\'ll notify you about bookings, payments and more
                  </div>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
                      background: n.is_read ? 'transparent' : 'rgba(232,184,109,0.03)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <NotifIcon type={n.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          color: n.is_read ? 'rgba(255,255,255,0.7)' : 'white',
                          fontSize: 13, fontWeight: n.is_read ? 400 : 600,
                          lineHeight: 1.3,
                        }}>{n.title}</div>
                        {!n.is_read && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8B86D', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
                      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 5 }}>{timeAgo(n.created_at)}</div>
                    </div>
                  </div>
                ))
              )}

              <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontWeight: 500, letterSpacing: 1 }}>
                  LALA KENYA NOTIFICATIONS
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
'''

with open('src/app/components/NotificationBell.tsx', 'w', encoding='utf-8') as f:
    f.write(bell)
print("NotificationBell updated")
