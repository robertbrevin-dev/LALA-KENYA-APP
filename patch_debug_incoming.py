# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "        const call = payload.new;\n        if (call.call_status === 'ringing') {",
    "        const call = payload.new;\n        console.log('INCOMING CALL PAYLOAD:', call);\n        if (call.call_status === 'ringing') {"
)

print("Done" if "INCOMING CALL PAYLOAD" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
