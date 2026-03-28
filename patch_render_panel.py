# -*- coding: utf-8 -*-

# Home.tsx
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "      <BottomNav type=\"guest\" />\n    </PhoneFrame>",
    "      <BottomNav type=\"guest\" />\n      {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}\n    </PhoneFrame>"
)
print("Home:", "{notifOpen" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Home.tsx', 'wb').write(out.encode('utf-8'))

# HostDashboard.tsx
with open('src/app/pages/HostDashboard.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c2 = c2.replace(
    "      <BottomNav type=\"host\" />\n    </PhoneFrame>",
    "      <BottomNav type=\"host\" />\n      {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}\n    </PhoneFrame>"
)
print("HostDashboard:", "{notifOpen" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/HostDashboard.tsx', 'wb').write(out2.encode('utf-8'))
print("Saved")
