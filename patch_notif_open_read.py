# -*- coding: utf-8 -*-

for filename in ['src/app/pages/Home.tsx', 'src/app/pages/HostDashboard.tsx']:
    with open(filename, 'rb') as f: raw = f.read()
    crlf = b'\r\n' in raw
    c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

    c = c.replace(
        "<NotificationBell onOpen={() => setNotifOpen(true)} />",
        "<NotificationBell onOpen={() => { setNotifOpen(true); markAllNotificationsRead(); }} />"
    )

    print(f"{filename}:", "markAllNotificationsRead" in c)
    out = c.replace('\n', '\r\n') if crlf else c
    open(filename, 'wb').write(out.encode('utf-8'))

print("Saved")
