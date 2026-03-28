# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Also listen for 'ended' on receiver side so host hanging up ends guest's call
c = c.replace(
    "      .on('postgres_changes', {\n        event: 'UPDATE', schema: 'public', table: 'calls',\n        filter: 'caller_id=eq.' + currentUser.id",
    """      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'calls',
        filter: 'receiver_id=eq.' + currentUser.id
      }, (payload) => {
        if (payload.new.call_status === 'ended') {
          setCallStatus({ active: false });
          setIncomingCall(null);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'calls',
        filter: 'caller_id=eq.' + currentUser.id"""
)

print("Done" if "receiver_id=eq." in c and c.count("receiver_id=eq.") >= 2 else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
