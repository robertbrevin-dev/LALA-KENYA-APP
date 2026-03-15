# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  // Sync callState from realtime AppContext updates\n  useEffect(() => {\n    if (!callStatus.active) {\n      setCallState('calling'); // reset\n    } else if ((callStatus as any).callState === 'connected') {\n      setCallState('connected');\n    }\n  }, [callStatus.active, (callStatus as any).callState]);",
    "  // Sync callState from realtime AppContext updates\n  useEffect(() => {\n    if (!callStatus.active) {\n      setCallState('calling');\n    } else if ((callStatus as any).connected) {\n      setCallState('connected');\n    }\n  }, [callStatus.active, (callStatus as any).connected]);"
)

print("Done" if "(callStatus as any).connected" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
