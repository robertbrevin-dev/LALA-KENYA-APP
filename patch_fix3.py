# -*- coding: utf-8 -*-

# Fix 1: AppContext - fix callError destructure
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "    const { data: callRow, error: callError } = await supabase.from('calls').insert({\n    // debug",
    "    const { data: callRow, error: callError } = await supabase.from('calls').insert({"
)

print("AppContext fix:", "callError" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))

# Fix 2: App.tsx - move GlobalIncomingCall INSIDE AppProvider
with open('src/app/App.tsx', 'rb') as f: raw2 = f.read()
crlf2 = b'\r\n' in raw2
c2 = raw2.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c2 = c2.replace(
    "function GlobalIncomingCall() {",
    "function GlobalIncomingCallInner() {"
)
c2 = c2.replace(
    "        <GlobalIncomingCall />",
    "        <GlobalIncomingCallInner />"
)
c2 = c2.replace(
    "at GlobalIncomingCall",
    "at GlobalIncomingCallInner"
)

print("App fix:", "GlobalIncomingCallInner" in c2)
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/App.tsx', 'wb').write(out2.encode('utf-8'))
print("Both saved")
