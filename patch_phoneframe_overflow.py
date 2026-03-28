# -*- coding: utf-8 -*-
with open('src/app/components/PhoneFrame.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "className={`w-full md:max-w-[390px] md:rounded-[44px] overflow-hidden flex flex-col ${className}`}",
    "className={`w-full md:max-w-[390px] md:rounded-[44px] flex flex-col ${className}`}"
)

# Add inner div with overflow-hidden to keep content clipped but allow dropdowns
c = c.replace(
    "        <IncomingCallBanner />\n        <PullToRefresh>",
    "        <IncomingCallBanner />\n        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'inherit' }}>\n        <PullToRefresh>"
)

c = c.replace(
    "        </PullToRefresh>",
    "        </PullToRefresh>\n        </div>"
)

print("Done" if "overflow: 'hidden'" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/components/PhoneFrame.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
