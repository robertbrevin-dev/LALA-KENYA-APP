# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add error logging to startCall
c = c.replace(
    "    }).select().single();\n    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });",
    "    }).select().single();\n    if (callError) { console.error('CALL INSERT ERROR:', JSON.stringify(callError)); } else { console.log('CALL OK:', callRow?.id); }\n    setCallStatus({ active: true, conversationId, participantName, duration: 0, callId: callRow?.id, callType });"
)

print("Done" if "CALL INSERT ERROR" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved AppContext")

# Fix otherUserName - force re-fetch using remoteConv directly
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf2 = b'\r\n' in raw
c2 = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c2 = c2.replace(
    "  useEffect(() => {\n    if (!currentUser || !remoteConv) return;\n    const otherId = currentUser.role === 'host' ? remoteConv.guest_id : remoteConv.host_id;\n    if (!otherId) return;\n    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()\n      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });\n  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id]);",
    """  useEffect(() => {
    if (!currentUser) return;
    const conv = remoteConv || (activeConversation ? { guest_id: currentUser.role === 'host' ? activeConversation.participantId : null, host_id: currentUser.role === 'guest' ? activeConversation.participantId : null } : null);
    if (!conv) return;
    const otherId = currentUser.role === 'host' ? conv.guest_id : conv.host_id;
    console.log('Fetching other user name, otherId:', otherId, 'role:', currentUser.role);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data, error }) => {
        console.log('Profile fetch result:', data, error);
        if (data?.full_name) setOtherUserName(data.full_name);
      });
  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);"""
)

print("Done2" if "Fetching other user" in c2 else "FAILED2")
out2 = c2.replace('\n', '\r\n') if crlf2 else c2
open('src/app/pages/Conversation.tsx', 'wb').write(out2.encode('utf-8'))
print("Saved Conversation")
