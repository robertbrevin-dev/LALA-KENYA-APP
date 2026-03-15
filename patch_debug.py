# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')
c = c.replace(
    "  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id]);",
    "  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id]);\n  console.log('DEBUG role:', currentUser?.role, 'host_id:', remoteConv?.host_id, 'guest_id:', remoteConv?.guest_id, 'otherUserName:', otherUserName);"
)
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
