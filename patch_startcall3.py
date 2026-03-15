# -*- coding: utf-8 -*-
import re
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Find exact end of startCall block
start = c.find('const startCall')
end = c.find('const endCall')
end2 = c.find('\n', c.find('setCallStatus({ active: false })', end)) + 1
print("start:", start, "end:", end, "end2:", end2)
print("BLOCK:", repr(c[end:end2+5]))
