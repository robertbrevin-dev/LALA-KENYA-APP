with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
idx = c.find('const startCall')
print(repr(c[idx:idx+600]))
