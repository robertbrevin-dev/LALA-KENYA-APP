# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix: guest should see host name, host should see guest name
# The header shows otherUserName — that's already correct IF otherUserName is set right
# Problem: remoteConv.host_name may be null for old rows
# Force fetch from profiles always
c = c.replace(
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
  }, [activeConversation?.id, currentUser?.id, remoteConv?.id]);""",
    """  useEffect(() => {
    if (!currentUser || !remoteConv) return;
    const otherId = currentUser.role === 'host' ? remoteConv.guest_id : remoteConv.host_id;
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id]);"""
)

print("Done" if "remoteConv.guest_id" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
