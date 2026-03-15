# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix conversation upsert to store both guest_name and host_name
c = c.replace(
    "      participant_id: participantId, participant_name: participantName,\n      participant_phone: participantPhone ?? null, participant_role: participantRole,",
    "      participant_id: participantId, participant_name: participantName,\n      participant_phone: participantPhone ?? null, participant_role: participantRole,\n      guest_name: isGuest ? (currentUser?.name || currentUser?.email || '') : participantName,\n      host_name: isGuest ? participantName : (currentUser?.name || currentUser?.email || ''),"
)

# Fix conversation mapping to show correct name based on role
c = c.replace(
    "          participantId: c.participant_id || '', participantName: c.participant_name || 'Host',",
    "          participantId: c.participant_id || '', participantName: currentUser?.role === 'host' ? (c.guest_name || c.participant_name || 'Guest') : (c.host_name || c.participant_name || 'Host'),"
)

print("Done" if "guest_name" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
