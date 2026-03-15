# -*- coding: utf-8 -*-
with open('src/app/components/PhoneFrame.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "import { ReactNode } from 'react';\nimport PullToRefresh from './PullToRefresh';",
    "import { ReactNode } from 'react';\nimport PullToRefresh from './PullToRefresh';\nimport { GlobalIncomingCallInner } from '../App';"
)

c = c.replace(
    "        <PullToRefresh>",
    "        <GlobalIncomingCallInner />\n        <PullToRefresh>"
)

print("Done" if "GlobalIncomingCallInner" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/PhoneFrame.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
