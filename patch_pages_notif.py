# -*- coding: utf-8 -*-

for filename in ['src/app/pages/Home.tsx', 'src/app/pages/HostDashboard.tsx']:
    with open(filename, 'rb') as f: raw = f.read()
    crlf = b'\r\n' in raw
    c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

    if "NotificationPanel" not in c:
        c = c.replace(
            "import NotificationBell from '../components/NotificationBell';",
            "import NotificationBell from '../components/NotificationBell';\nimport NotificationPanel from '../components/NotificationPanel';"
        )

    # Add notifOpen state
    if "notifOpen" not in c:
        c = c.replace(
            "  const navigate = useNavigate();",
            "  const navigate = useNavigate();\n  const [notifOpen, setNotifOpen] = useState(false);\n  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();"
        )

    # Fix bell to pass onOpen
    c = c.replace(
        "<NotificationBell />",
        "<NotificationBell onOpen={() => setNotifOpen(true)} />"
    )

    # Add panel render - add before closing PhoneFrame
    if "NotificationPanel" not in c:
        c = c.replace(
            "</PhoneFrame>",
            "  {notifOpen && <NotificationPanel notifications={notifications} unreadCount={unreadCount} onClose={() => setNotifOpen(false)} onRead={markNotificationRead} onReadAll={markAllNotificationsRead} />}\n</PhoneFrame>",
            1
        )
    else:
        c = c.replace(
            "{notifOpen && <NotificationPanel",
            "{notifOpen && <NotificationPanel"
        )

    print(f"{filename}:", "NotificationPanel" in c)
    out = c.replace('\n', '\r\n') if crlf else c
    open(filename, 'wb').write(out.encode('utf-8'))

print("All saved")
