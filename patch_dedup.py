# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [localDuration, setLocalDuration] = useState(0);\n  const [localDuration, setLocalDuration] = useState(0);",
    "  const [localDuration, setLocalDuration] = useState(0);"
)

print("Done" if c.count("const [localDuration") == 1 else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
