# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Find the startCall line in interface and add new ones
c = c.replace(
    "  startCall: (conversationId: string, participantName: string, participantPhone?: string) => void;",
    "  startCall: (conversationId: string, participantName: string, participantPhone?: string, receiverId?: string, callType?: string) => void;\n  acceptCall: (call: any) => void;\n  rejectCall: (call: any) => void;\n  incomingCall: any;"
)
c = c.replace(
    "  endCall: () => void;",
    "  endCall: () => void;"
)

print("Done" if "acceptCall: (call" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
