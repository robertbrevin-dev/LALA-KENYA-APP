# -*- coding: utf-8 -*-

bell_component = '''import { useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationBell() {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 36, height: 36, borderRadius: 13, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative'
        }}
      >
        <Bell size={16} color="white" />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4, width: 18, height: 18,
            borderRadius: '50%', background: '#E8B86D', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#000'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            style={{
              position: 'absolute', top: 44, right: 0, width: 300, maxHeight: 400,
              overflowY: 'auto', zIndex: 9999,
              background: '#0d1f1a', border: '1px solid rgba(62,207,178,0.2)',
              borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.6)'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Notifications</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {unreadCount > 0 && (
                  <button onClick={markAllNotificationsRead} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(62,207,178,0.8)', fontSize: 11 }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={14} color="rgba(255,255,255,0.5)" />
                </button>
              </div>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer', background: n.is_read ? 'transparent' : 'rgba(62,207,178,0.05)',
                    display: 'flex', gap: 10, alignItems: 'flex-start'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.is_read ? 'transparent' : '#3ECFB2', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: n.is_read ? 400 : 600 }}>{n.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{n.body}</div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
'''

with open('src/app/components/NotificationBell.tsx', 'w', encoding='utf-8') as f:
    f.write(bell_component)
print("Bell component created")

# Add to Home.tsx
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "NotificationBell" not in c:
    c = c.replace(
        "import BackRefreshBar from",
        "import NotificationBell from '../components/NotificationBell';\nimport BackRefreshBar from"
    )
    c = c.replace(
        "            <motion.button\n              whileTap={{ scale: 0.9 }}\n              onClick={() => navigate('/map')}",
        "            <NotificationBell />\n            <motion.button\n              whileTap={{ scale: 0.9 }}\n              onClick={() => navigate('/map')}"
    )

print("Home.tsx:", "NotificationBell" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Home.tsx', 'wb').write(out.encode('utf-8'))

# Add to HostDashboard.tsx
with open('src/app/pages/HostDashboard.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "NotificationBell" not in c2:
    c2 = c2.replace(
        "import BackRefreshBar from",
        "import NotificationBell from '../components/NotificationBell';\nimport BackRefreshBar from"
    )
    c2 = c2.replace(
        "              onClick={() => navigate('/host/profile')}",
        "              onClick={() => navigate('/host/profile')}"
    )
    # Add bell next to avatar button
    c2 = c2.replace(
        "            <button\n              onClick={() => navigate('/host/profile')}",
        "            <NotificationBell />\n            <button\n              onClick={() => navigate('/host/profile')}"
    )

print("HostDashboard:", "NotificationBell" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/HostDashboard.tsx', 'wb').write(out2.encode('utf-8'))
print("All saved")
