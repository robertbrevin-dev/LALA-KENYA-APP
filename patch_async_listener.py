# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "      }, (payload) => {\n        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {",
    "      }, async (payload) => {\n        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {"
)

print("Done" if "async (payload) => {\n        if (payload.new.call_status === 'rejected'" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
