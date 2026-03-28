# -*- coding: utf-8 -*-
with open('src/app/App.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "IncomingCallBanner" not in c:
    c = c.replace(
        "import { RouterProvider } from 'react-router-dom';",
        "import { RouterProvider } from 'react-router-dom';\nimport IncomingCallBanner from './components/IncomingCallBanner';"
    )
    c = c.replace(
        "        <RouterProvider router={router} />",
        "        <RouterProvider router={router} />\n        <IncomingCallBanner />\n        <audio id=\"remote-audio\" autoPlay playsInline style={{ display: 'none' }} />"
    )

print("App:", "IncomingCallBanner" in c and "remote-audio" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/App.tsx', 'wb').write(out.encode('utf-8'))
print("Saved App.tsx")
