with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Remove both duplicate useEffects for otherUserName
block = """  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const otherId = currentUser.role === 'host'
      ? (remoteConv?.guest_id || activeConversation.guestId) 
      : (remoteConv?.host_id || activeConversation.participantId);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [activeConversation, currentUser, remoteConv]);"""

# Remove all occurrences
while block in c:
    c = c.replace(block, '')

print("Removed blocks, now inserting after activeConversation...")

# Insert after activeConversation definition
insert_after = "  const activeConversation = conversation || (remoteConv ? {"
# Find end of activeConversation block (closing });)
idx = c.find(insert_after)
if idx == -1:
    print("Could not find activeConversation")
else:
    # Find the closing }); after this
    end_idx = c.find('\n  });', idx)
    if end_idx == -1:
        end_idx = c.find('\n  } : null);', idx)
    insert_point = c.find('\n', end_idx + 1) + 1
    new_effect = """  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const otherId = currentUser.role === 'host'
      ? (remoteConv?.guest_id || activeConversation.guestId)
      : (remoteConv?.host_id || activeConversation.participantId);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [activeConversation?.id, currentUser, remoteConv]);
"""
    c = c[:insert_point] + new_effect + c[insert_point:]
    print("Inserted after activeConversation")

out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
