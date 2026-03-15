with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "                background: isCurrentUser ? 'var(--lala-gold)' : 'var(--lala-card)',\n                        color: isCurrentUser ? 'var(--lala-deep)' : 'var(--lala-white)',",
    "                background: isCurrentUser ? 'var(--lala-gold)' : 'rgba(59,130,246,0.85)',\n                        color: isCurrentUser ? 'var(--lala-deep)' : '#ffffff',"
)

print("Done" if 'rgba(59,130,246' in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
