# -*- coding: utf-8 -*-
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const { properties, currentUser } = useApp();\n  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);\n  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();",
    "  const { properties, currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();\n  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);"
)

print("Done" if c.count("useApp()") == 1 else "FAILED - count: " + str(c.count("useApp()")))
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Home.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
