with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  const [remoteConv, setRemoteConv] = useState<any>(null);",
    "  const [remoteConv, setRemoteConv] = useState<any>(null);\n  const [otherUserName, setOtherUserName] = useState<string>('');"
)

c = c.replace(
    "  useEffect(() => {\n    supabase.from('conversations').select('*').eq('id', id).maybeSingle()\n      .then(({ data }) => { if (data) setRemoteConv(data); });\n  }, [id, conversation]);",
    """  useEffect(() => {
    supabase.from('conversations').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => { if (data) setRemoteConv(data); });
  }, [id, conversation]);

  useEffect(() => {
    if (!activeConversation || !currentUser) return;
    const otherId = currentUser.role === 'host'
      ? (remoteConv?.guest_id || activeConversation.guestId)
      : (remoteConv?.host_id || activeConversation.participantId);
    if (!otherId) return;
    supabase.from('profiles').select('full_name').eq('id', otherId).maybeSingle()
      .then(({ data }) => { if (data?.full_name) setOtherUserName(data.full_name); });
  }, [activeConversation, currentUser, remoteConv]);"""
)

c = c.replace(
    "                {activeConversation?.participantName}",
    "                {otherUserName || activeConversation?.participantName}"
)

print("Done" if "otherUserName" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
