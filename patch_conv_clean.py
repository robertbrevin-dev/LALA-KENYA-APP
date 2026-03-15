with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Remove ALL otherUserName useEffect blocks
import re
c = re.sub(
    r"  useEffect\(\(\) => \{\n    if \(!activeConversation \|\| !currentUser\) return;\n    const otherId = currentUser\.role.*?  \}, \[activeConversation.*?\]\);\n",
    '',
    c,
    flags=re.DOTALL
)

# Now insert ONE clean version after activeConversation definition
marker = "    unreadCount: 0, messages: [],\n  } : null);\n"
good_effect = """    unreadCount: 0, messages: [],
  } : null);
  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const otherId = currentUser.role === 'host'
      ? remoteConv?.guest_id
      : (remoteConv?.host_id || activeConversation.participantId);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [activeConversation?.id, currentUser?.id, remoteConv?.id]);
"""
c = c.replace(marker, good_effect)

count = c.count('setOtherUserName')
print(f"setOtherUserName appears {count} times (should be 2)")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Done")
