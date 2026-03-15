# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Find and show what's there
idx = c.find('const startCall')
print("Found at:", idx)
print(repr(c[idx:idx+400]))
