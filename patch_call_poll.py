# -*- coding: utf-8 -*-
with open('src/app/pages/Conversation.tsx', 'rb') as f: raw = f.read()
crlf = b'\r\n' in raw
c = raw.decode('utf-8').replace('\r\n','\n').replace('\r','\n')

c = c.replace(
    "  // Timer: count up when connected",
    """  // Fallback poll: check call status every 2s while calling
  useEffect(() => {
    if (callState !== 'calling' || !callStatus.callId) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('calls').select('call_status').eq('id', callStatus.callId).maybeSingle();
      if (data?.call_status === 'accepted') setCallState('connected');
      if (data?.call_status === 'rejected' || data?.call_status === 'ended') {
        setCallState('calling');
        endCall();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [callState, callStatus.callId]);

  // Timer: count up when connected"""
)

print("Done" if "Fallback poll" in c else "FAILED")
out = c.replace('\n', '\r\n') if crlf else c
open('src/app/pages/Conversation.tsx', 'wb').write(out.encode('utf-8'))
print("Saved")
