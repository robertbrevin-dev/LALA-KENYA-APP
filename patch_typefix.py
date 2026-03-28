# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  callStatus: CallStatus;\n  notifications: any[];\n  unreadCount: number;\n  markNotificationRead: (id: string) => void;\n  markAllNotificationsRead: () => void;",
    "  callStatus: CallStatus;\n  callConnected: boolean;\n  notifications: any[];\n  unreadCount: number;\n  markNotificationRead: (id: string) => void;\n  markAllNotificationsRead: () => void;"
)

print("Done" if "callConnected: boolean" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
