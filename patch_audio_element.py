# -*- coding: utf-8 -*-
with open('src/app/App.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "        <RouterProvider router={router} />",
    "        <RouterProvider router={router} />\n        <audio id=\"remote-audio\" autoPlay playsInline style={{ display: 'none' }} />"
)

print("Done" if "remote-audio" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/App.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
