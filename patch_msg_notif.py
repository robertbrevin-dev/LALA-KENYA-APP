# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Find sendMessage and add notification to recipient
if "new_message" not in c:
    c = c.replace(
        "    setConversations(prev =>",
        """    // Notify the other person
    const recipientId = currentUser?.role === 'guest'
      ? conv?.host_id
      : conv?.guest_id;
    if (recipientId) {
      import('./utils/notify' as any).then((m: any) => {
        m.sendNotification({
          userId: recipientId,
          type: 'new_message',
          propertyTitle: conv?.property_title || '',
          guestName: currentUser?.role === 'guest' ? currentUser?.name : undefined,
          hostName: currentUser?.role === 'host' ? currentUser?.name : undefined,
        });
      });
    }
    setConversations(prev =>"""
    )

print("Done" if "new_message" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
