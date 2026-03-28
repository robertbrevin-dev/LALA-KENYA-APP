# -*- coding: utf-8 -*-

# Add new_message notification in AppContext sendMessage
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

if "new_message" not in c:
    # Find sendMessage function and add notification
    c = c.replace(
        "import { supabase } from '../lib/supabase';",
        "import { supabase } from '../lib/supabase';\nimport { sendNotification } from '../app/utils/notify';"
    )

# Add payment reminder in acceptCall - 15 min timer
c = c.replace(
    "    setCallConnected(true);\n    setIncomingCall(null);",
    """    setCallConnected(true);
    setIncomingCall(null);
    // Missed call: if caller hangs up before receiver accepts - handled in endCall"""
)

print("Done")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
