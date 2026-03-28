# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix call button - always enabled, not dependent on participantPhone
c = c.replace(
    """              style={{
                background: activeConversation?.participantPhone ? 'var(--lala-teal)' : 'var(--lala-deep)',
                opacity: activeConversation?.participantPhone ? 1 : 0.6
              }}
              title={activeConversation?.participantPhone ? `Call ${activeConversation?.participantPhone}` : 'Phone number not available'}""",
    """              style={{
                background: 'var(--lala-teal)',
                opacity: 1
              }}
              title="Start voice call\""""
)

print("Fix1:", "Start voice call" in c)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
