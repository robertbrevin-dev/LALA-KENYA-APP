# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "    const callerName = otherUserName || activeConversation?.participantName || '';",
    "    const callerName = otherUserName || activeConversation?.participantName || '';"
)
# Fix name shown on call screen - should show OTHER person not self
c = c.replace(
    "                {callStatus.participantName || ''}",
    "                {otherUserName || callStatus.participantName || ''}"
)
print("Done" if "otherUserName || callStatus" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
