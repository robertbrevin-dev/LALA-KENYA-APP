# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Fix: guest should use host_id, host should use guest_id
# Also fix the activeConversation fallback - participantId IS the other person
c = c.replace(
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
  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);""",
    """  useEffect(() => {
    if (!currentUser) return;
    // For guest: fetch host profile. For host: fetch guest profile.
    const otherId = currentUser.role === 'host'
      ? (remoteConv?.guest_id || activeConversation?.participantId)
      : (remoteConv?.host_id || activeConversation?.participantId);
    console.log('Fetching other user name, otherId:', otherId, 'role:', currentUser.role);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data, error }) => {
        console.log('Profile fetch result:', data, error);
        if (data?.full_name) setOtherUserName(data.full_name);
      });
  }, [currentUser?.id, remoteConv?.guest_id, remoteConv?.host_id, activeConversation?.participantId]);"""
)

print("Done" if "For guest: fetch host" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
