# -*- coding: utf-8 -*-
with open('src/app/context/AppContext.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

# Add incoming call listener after incomingCall state
c = c.replace(
    "  const [incomingCall, setIncomingCall] = useState<any>(null);",
    """  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    const sub = supabase.channel('incoming-calls-' + currentUser.id)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'calls',
        filter: 'receiver_id=eq.' + currentUser.id
      }, async (payload) => {
        const call = payload.new;
        if (call.call_status === 'ringing') {
          const { data: caller } = await supabase.from('profiles').select('full_name').eq('id', call.caller_id).maybeSingle();
          setIncomingCall({ ...call, caller_name: caller?.full_name || 'Unknown' });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'calls',
        filter: 'caller_id=eq.' + currentUser.id
      }, (payload) => {
        if (payload.new.call_status === 'rejected') {
          setCallStatus({ active: false });
        }
        if (payload.new.call_status === 'accepted') {
          setCallStatus(prev => ({ ...prev, active: true }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [currentUser?.id]);"""
)

print("Done" if "incoming-calls-" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/context/AppContext.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
