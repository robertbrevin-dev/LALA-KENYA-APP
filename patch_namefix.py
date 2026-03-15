# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix header name - never fall back to participantName (it's wrong for guest)
c = c.replace(
    "                {otherUserName || activeConversation?.participantName}",
    "                {otherUserName || (currentUser?.role === 'guest' ? remoteConv?.host_name : remoteConv?.guest_name) || activeConversation?.participantName}"
)

# Fix call screen name
c = c.replace(
    "                {otherUserName || callStatus.participantName || ''}",
    "                {otherUserName || (currentUser?.role === 'guest' ? remoteConv?.host_name : remoteConv?.guest_name) || callStatus.participantName || ''}"
)

print("Done" if "host_name" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
