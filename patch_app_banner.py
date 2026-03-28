# -*- coding: utf-8 -*-

# Remove banner from PhoneFrame, put it globally in App.tsx instead
with open('src/app/components/PhoneFrame.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace("import IncomingCallBanner from './IncomingCallBanner';\n", "")
c = c.replace("        <IncomingCallBanner />\n        ", "")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/PhoneFrame.tsx', 'wb').write(out.encode('utf-8'))
print("PhoneFrame cleaned")

# Add banner globally in App.tsx inside AppProvider
with open('src/app/App.tsx', 'rb') as f: raw2 = f.read()
crlf2 = b'\r\n' in raw2
c2 = raw2.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c2 = c2.replace(
    "import { RouterProvider } from 'react-router-dom';",
    "import { RouterProvider } from 'react-router-dom';\nimport IncomingCallBanner from './components/IncomingCallBanner';"
)

c2 = c2.replace(
    "        <RouterProvider router={router} />",
    "        <RouterProvider router={router} />\n        <IncomingCallBanner />"
)

out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/App.tsx', 'wb').write(out2.encode('utf-8'))
print("App.tsx updated")
