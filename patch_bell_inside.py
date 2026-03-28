# -*- coding: utf-8 -*-
with open('src/app/components/NotificationBell.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "              position: 'fixed', top: 60, right: 8, width: 'calc(100vw - 16px)', maxWidth: 370, maxHeight: '70vh',",
    "              position: 'absolute', top: 44, right: -8, width: 280, maxHeight: '65vh',"
)

# Make the wrapper relative positioned so dropdown stays inside
c = c.replace(
    "    <div style={{ position: 'relative' }}>",
    "    <div style={{ position: 'relative', zIndex: 9999 }}>"
)

print("Done" if "position: 'absolute', top: 44" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/NotificationBell.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
