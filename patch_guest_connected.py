# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# When caller sees 'accepted' update, set callState in callStatus
c = c.replace(
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true, callState: 'connected' }));\n        }\n        if (payload.new.call_status === 'rejected') {\n          setCallStatus({ active: false });\n        }",
    "        if (payload.new.call_status === 'accepted') {\n          setCallStatus(prev => ({ ...prev, active: true, connected: true }));\n        }\n        if (payload.new.call_status === 'rejected' || payload.new.call_status === 'ended') {\n          setCallStatus({ active: false });\n        }"
)

print("Done" if "connected: true" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
