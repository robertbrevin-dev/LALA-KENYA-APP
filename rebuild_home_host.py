# -*- coding: utf-8 -*-

# HOME.TSX
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "NotificationBell" not in c:
    c = c.replace(
        "import BackRefreshBar from",
        "import NotificationBell from '../components/NotificationBell';\nimport NotificationPanel from '../components/NotificationPanel';\nimport BackRefreshBar from"
    )

if "notifOpen" not in c:
    c = c.replace(
        "  const navigate = useNavigate();",
        "  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);"
    )

# Add notif destructuring to useApp
if "markAllNotificationsRead" not in c:
    c = c.replace(
        "  const { properties, currentUser } = useApp();",
        "  const { properties, currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();"
    )

# Add bell next to map button
if "<NotificationBell" not in c:
    c = c.replace(
        "            <motion.button\n              whileTap={{ scale: 0.9 }}\n              onClick={() => navigate('/map')}",
        "            <NotificationBell onOpen={() => { setNotifOpen(true); markAllNotificationsRead(); }} />\n            <motion.button\n              whileTap={{ scale: 0.9 }}\n              onClick={() => navigate('/map')}"
    )

# Add panel before closing BottomNav
if "NotificationPanel" not in c:
    c = c.replace(
        "      <BottomNav type=\"guest\" />",
        "      <BottomNav type=\"guest\" />\n      {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}"
    )

print("Home:", "NotificationBell" in c and "NotificationPanel" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Home.tsx', 'wb').write(out.encode('utf-8'))

# HOSTDASHBOARD.TSX
with open('src/app/pages/HostDashboard.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "NotificationBell" not in c2:
    c2 = c2.replace(
        "import BackRefreshBar from",
        "import NotificationBell from '../components/NotificationBell';\nimport NotificationPanel from '../components/NotificationPanel';\nimport BackRefreshBar from"
    )

if "notifOpen" not in c2:
    c2 = c2.replace(
        "  const navigate = useNavigate();",
        "  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);"
    )

if "markAllNotificationsRead" not in c2:
    c2 = c2.replace(
        "  const { currentUser, loading: appLoading } = useApp();",
        "  const { currentUser, loading: appLoading, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();"
    )

if "<NotificationBell" not in c2:
    c2 = c2.replace(
        "            <button\n              onClick={() => navigate('/host/profile')}",
        "            <NotificationBell onOpen={() => { setNotifOpen(true); markAllNotificationsRead(); }} />\n            <button\n              onClick={() => navigate('/host/profile')}"
    )

if "NotificationPanel" not in c2:
    c2 = c2.replace(
        "      <BottomNav type=\"host\" />",
        "      <BottomNav type=\"host\" />\n      {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}"
    )

print("HostDashboard:", "NotificationBell" in c2 and "NotificationPanel" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/HostDashboard.tsx', 'wb').write(out2.encode('utf-8'))
print("All saved")
