# -*- coding: utf-8 -*-
with open('src/app/components/NotificationBell.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "              position: 'absolute', top: 44, right: 0, width: 320, maxHeight: 480,",
    "              position: 'fixed', top: 60, right: 8, width: 'calc(100vw - 16px)', maxWidth: 370, maxHeight: '70vh',"
)

print("Done" if "calc(100vw" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/NotificationBell.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
