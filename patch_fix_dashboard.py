# -*- coding: utf-8 -*-

# Fix PhoneFrame - restore overflow-hidden
with open('src/app/components/PhoneFrame.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "className={`w-full md:max-w-[390px] md:rounded-[44px] flex flex-col ${className}`}",
    "className={`w-full md:max-w-[390px] md:rounded-[44px] overflow-hidden flex flex-col ${className}`}"
)
print("PhoneFrame:", "overflow-hidden" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/PhoneFrame.tsx', 'wb').write(out.encode('utf-8'))

# Fix HostDashboard - merge duplicate useApp calls
with open('src/app/pages/HostDashboard.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c2 = c2.replace(
    "  const [notifOpen, setNotifOpen] = useState(false);\n  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();\n  const { currentUser, loading: appLoading } = useApp();",
    "  const [notifOpen, setNotifOpen] = useState(false);\n  const { currentUser, loading: appLoading, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();"
)

print("HostDashboard:", c2.count("useApp()") == 1)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/HostDashboard.tsx', 'wb').write(out2.encode('utf-8'))

# Fix Home.tsx - same issue
with open('src/app/pages/Home.tsx', 'rb') as f: raw = f.read()
crlf3 = b'\r\n' in raw
c3 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c3 = c3.replace(
    "  const [notifOpen, setNotifOpen] = useState(false);\n  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useApp();\n  const { currentUser",
    "  const [notifOpen, setNotifOpen] = useState(false);\n  const { currentUser"
)

# Add notif destructuring to existing useApp call
c3 = c3.replace(
    "  const { currentUser",
    "  const { currentUser, notifications, unreadCount, markNotificationRead, markAllNotificationsRead"
)

print("Home:", c3.count("useApp()"))
out3 = c3.replace('\n', '\r\n') if crlf3 else c3
open('src/app/pages/Home.tsx', 'wb').write(out3.encode('utf-8'))
print("All saved")
