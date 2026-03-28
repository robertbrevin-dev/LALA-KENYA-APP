# -*- coding: utf-8 -*-
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const { properties, currentUser } = useApp();\n  const { t } = useLanguage();\n  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);\n  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();",
    "  const { properties, currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();\n  const { t } = useLanguage();\n  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);"
)

# Make sure NotificationPanel is rendered in JSX - add before last </PhoneFrame>
if "{notifOpen && <NotificationPanel" not in c:
    c = c.replace(
        "      <BottomNav active=\"home\" />",
        "      <BottomNav active=\"home\" />\n      {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}"
    )

print("useApp count:", c.count("useApp()"))
print("Panel rendered:", "{notifOpen && <NotificationPanel" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Home.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
