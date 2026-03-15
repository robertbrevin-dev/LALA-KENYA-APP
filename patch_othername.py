# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  useEffect(() => {\n    if (!activeConversation || !currentUser) return;\n    const otherId = currentUser.role === 'host'\n      ? remoteConv?.guest_id\n      : (remoteConv?.host_id || activeConversation.participantId);\n    if (!otherId) return;\n    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()\n      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });\n  }, [activeConversation?.id, currentUser?.id, remoteConv?.id]);",
    """  useEffect(() => {
    if (!currentUser) return;
    // Immediate fallback from conversation row
    if (remoteConv) {
      const fallback = currentUser.role === 'host' ? remoteConv.guest_name : remoteConv.host_name;
      if (fallback) setOtherUserName(fallback);
    }
    const otherId = currentUser.role === 'host'
      ? remoteConv?.guest_id
      : (remoteConv?.host_id || activeConversation?.participantId);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [activeConversation?.id, currentUser?.id, remoteConv?.id]);"""
)

print("Done" if "guest_name" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
